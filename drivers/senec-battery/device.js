'use strict';

const Homey = require('homey');
const http = require('http.min');

class SenecDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('SenecDevice has been initialized');

    // Add missing capabilities for Energy Tab integration
    if (!this.hasCapability('measure_power')) {
      await this.addCapability('measure_power');
      this.log('Added measure_power capability');
    }
    if (!this.hasCapability('meter_power.charged')) {
      await this.addCapability('meter_power.charged');
      this.log('Added meter_power.charged capability');
    }
    if (!this.hasCapability('meter_power.discharged')) {
      await this.addCapability('meter_power.discharged');
      this.log('Added meter_power.discharged capability');
    }

    // Initialize cumulative energy meters
    this.chargedEnergy = this.getCapabilityValue('meter_power.charged') || 0;
    this.dischargedEnergy = this.getCapabilityValue('meter_power.discharged') || 0;
    this.lastPowerUpdate = Date.now();

    this.registerCapabilityListener('onoff', async (value) => {
      if (value) {
        this.forceCharge();
      } else {
        this.allowDischarge();
      }
    });

    this.pollInterval = setInterval(() => {
      this.pollBatteryStatus();
    }, 3000);
  }

  // Methode, um den Batteriestatus abzufragen
  async pollBatteryStatus() {
    try {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

      const ipAddress = this.getSetting('ipAddress');

      const result = await http.post(`https://${ipAddress}/lala.cgi`, {
        BMS: {
          SYSTEM_SOC: '',
        },
        ENERGY: {
          GUI_BAT_DATA_VOLTAGE: '',
          GUI_BAT_DATA_CURRENT: '',
          GUI_BAT_DATA_POWER: '',
          GUI_INVERTER_POWER: '',
          GUI_HOUSE_POW: '',
          GUI_GRID_POW: '',
          GUI_CHARGING_INFO: '',
          SAFE_CHARGE_RUNNING: '',
        },
      });

      // this.log("Response: " + result.data);

      const jsonData = JSON.parse(result.data);

      const batVolt = jsonData.ENERGY.GUI_BAT_DATA_VOLTAGE.substring(3);
      const batCurrent = jsonData.ENERGY.GUI_BAT_DATA_CURRENT.substring(3);
      const batPower = jsonData.ENERGY.GUI_BAT_DATA_POWER.substring(3);
      const batCharge = jsonData.BMS.SYSTEM_SOC.substring(3);

      const inverterPower = jsonData.ENERGY.GUI_INVERTER_POWER.substring(3);
      const gridPower = jsonData.ENERGY.GUI_GRID_POW.substring(3);
      const housePower = jsonData.ENERGY.GUI_HOUSE_POW.substring(3);

      const isSafeChargeRunning = jsonData.ENERGY.SAFE_CHARGE_RUNNING;

      if (isSafeChargeRunning === 'u8_00') {
        if (this.getCapabilityValue('onoff')) {
          this.setCapabilityValue('onoff', false).catch(this.error);
        }
      } else if (!this.getCapabilityValue('onoff')) {
        this.setCapabilityValue('onoff', true).catch(this.error);
      }

      this.setCapabilityValue(
        'measure_voltage',
        this.parseFloat(`0x${batVolt}`),
      );
      this.setCapabilityValue(
        'measure_current',
        this.parseFloat(`0x${batCurrent}`),
      );
      const batteryPower = this.parseFloat(`0x${batPower}`);
      // SENEC API: negative = discharging, positive = charging
      // Energy Tab needs: positive = charging, negative = discharging
      // SENEC values are already correct for Energy Tab!

      this.log(`Battery Power: ${batteryPower}W (${batteryPower > 0 ? 'charging' : 'discharging'})`);
      this.setCapabilityValue('measure_power', batteryPower);

      // Update cumulative energy meters
      this.updateEnergyMeters(batteryPower);

      this.setCapabilityValue('measure_battery', Number(`0x${batCharge}`) / 10);

      // Parse other values for sharing with other devices
      const inverterPowerValue = this.parseFloat(`0x${inverterPower}`);
      const gridPowerValue = this.parseFloat(`0x${gridPower}`);
      const housePowerValue = this.parseFloat(`0x${housePower}`);

      // Emit data to other devices via the main controller pattern
      this.homey.app.emit('senec-data', {
        batteryPower: batteryPower, // Already inverted for Energy Tab
        inverterPower: inverterPowerValue,
        gridPower: gridPowerValue,
        housePower: housePowerValue
      });

      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
    } catch (error) {
      this.error('Error polling battery status:', error);
      // Set capabilities to null or 0 to indicate error state
      this.setCapabilityValue('measure_battery', null).catch(this.error);
      this.setCapabilityValue('measure_voltage', 0).catch(this.error);
      this.setCapabilityValue('measure_current', 0).catch(this.error);
      this.setCapabilityValue('measure_power', 0).catch(this.error);
    }
  }

  updateEnergyMeters(batteryPower) {
    const now = Date.now();
    const timeDiffSeconds = (now - this.lastPowerUpdate) / 1000;
    this.lastPowerUpdate = now;

    // Calculate energy in kWh (Power in W * time in hours)
    const energyKwh = Math.abs(batteryPower) * (timeDiffSeconds / 3600) / 1000;

    if (batteryPower > 0) {
      // Charging - add to charged energy
      this.chargedEnergy += energyKwh;
      this.setCapabilityValue('meter_power.charged', this.chargedEnergy).catch(this.error);
    } else if (batteryPower < 0) {
      // Discharging - add to discharged energy
      this.dischargedEnergy += energyKwh;
      this.setCapabilityValue('meter_power.discharged', this.dischargedEnergy).catch(this.error);
    }
  }

  parseFloat(str) {
    let float = 0;
    let exp;
    let int = 0;
    let multi = 1;
    if (/^0x/.exec(str)) {
      int = parseInt(str, 16);
    } else {
      for (let i = str.length - 1; i >= 0; i -= 1) {
        if (str.charCodeAt(i) > 255) {
          this.error('Invalid string parameter for float parsing');
          return false;
        }
        int += str.charCodeAt(i) * multi;
        multi *= 256;
      }
    }
    const sign = int >>> 31 ? -1 : 1;
    exp = ((int >>> 23) & 0xff) - 127;
    const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
    for (let i = 0; i < mantissa.length; i += 1) {
      float += parseInt(mantissa[i], 10) ? (2 ** exp) : 0;
      exp--;
    }
    return float * sign;
  }

  async forceCharge() {
    try {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

      const ipAddress = this.getSetting('ipAddress');

      await http.post(`https://${ipAddress}/lala.cgi`, {
        ENERGY: {
          SAFE_CHARGE_FORCE: 'u8_01',
        },
      });

      this.log('Force charge enabled');

      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
    } catch (error) {
      this.error('Error setting force charge mode:', error);
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
    }
  }

  async allowDischarge() {
    try {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

      const ipAddress = this.getSetting('ipAddress');

      await http.post(`https://${ipAddress}/lala.cgi`, {
        ENERGY: {
          SAFE_CHARGE_PROHIBIT: 'u8_01',
        },
      });

      this.log('Force charge disabled');

      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
    } catch (error) {
      this.error('Error disabling force charge mode:', error);
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('SenecDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('SenecDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('SenecDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('SenecDevice has been deleted');

    // Wenn das Gerät gelöscht wird, stoppe das Intervall
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

}

module.exports = SenecDevice;
