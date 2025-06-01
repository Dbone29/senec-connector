'use strict';

const Homey = require('homey');
const http = require('http.min');

class SenecDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('SenecDevice has been initialized');

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
      this.setCapabilityValue(
        'measure_power.battery',
        this.parseFloat(`0x${batPower}`),
      );
      this.setCapabilityValue('measure_battery', Number(`0x${batCharge}`) / 10);

      this.setCapabilityValue(
        'measure_power.inverter',
        this.parseFloat(`0x${inverterPower}`),
      );
      this.setCapabilityValue(
        'measure_power.grid',
        this.parseFloat(`0x${gridPower}`),
      );
      this.setCapabilityValue(
        'measure_power.house',
        this.parseFloat(`0x${housePower}`),
      );

      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;
    } catch (error) {
      this.error('Error polling battery status:', error);
      // Set capabilities to null or 0 to indicate error state
      this.setCapabilityValue('measure_battery', null).catch(this.error);
      this.setCapabilityValue('measure_voltage', 0).catch(this.error);
      this.setCapabilityValue('measure_current', 0).catch(this.error);
      this.setCapabilityValue('measure_power.battery', 0).catch(this.error);
      this.setCapabilityValue('measure_power.inverter', 0).catch(this.error);
      this.setCapabilityValue('measure_power.grid', 0).catch(this.error);
      this.setCapabilityValue('measure_power.house', 0).catch(this.error);
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
