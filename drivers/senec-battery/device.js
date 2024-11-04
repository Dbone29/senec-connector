"use strict";

const Homey = require("homey");

class MyDevice extends Homey.Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log("MyDevice has been initialized");

    this.pollInterval = setInterval(() => {
      this.pollBatteryStatus();
    }, 3000);
  }

  // Methode, um den Batteriestatus abzufragen
  async pollBatteryStatus() {
    try {
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

      var http = require("http.min");
      var result = await http.post(
        "https://" + this.getStoreValue("address") + "/lala.cgi",
        {
          BMS: {
            SYSTEM_SOC: "",
          },
          ENERGY: {
            GUI_INVERTER_POWER: "",
            GUI_BAT_DATA_VOLTAGE: "",
            GUI_BAT_DATA_CURRENT: "",
            GUI_BAT_DATA_POWER: "",
            GUI_INVERTER_POWER: "",
            GUI_HOUSE_POW: "",
            GUI_GRID_POW: "",
            GUI_CHARGING_INFO: "",
          },
        }
      );

      //this.log("Response: " + result.data);

      let jsonData = JSON.parse(result.data);

      let batVolt = jsonData.ENERGY.GUI_BAT_DATA_VOLTAGE.substring(3);
      let batCurrent = jsonData.ENERGY.GUI_BAT_DATA_CURRENT.substring(3);
      let batPower = jsonData.ENERGY.GUI_BAT_DATA_POWER.substring(3);
      let batCharge = jsonData.BMS.SYSTEM_SOC.substring(3);

      let inverterPower = jsonData.ENERGY.GUI_INVERTER_POWER.substring(3);
      let gridPower = jsonData.ENERGY.GUI_GRID_POW.substring(3);
      let housePower = jsonData.ENERGY.GUI_HOUSE_POW.substring(3);

      this.setCapabilityValue(
        "measure_voltage",
        this.parseFloat("0x" + batVolt)
      );
      this.setCapabilityValue(
        "measure_current",
        this.parseFloat("0x" + batCurrent)
      );
      this.setCapabilityValue(
        "measure_power.battery",
        this.parseFloat("0x" + batPower)
      );
      this.setCapabilityValue("measure_battery", Number("0x" + batCharge) / 10);


      this.setCapabilityValue(
        "measure_power.inverter",
        this.parseFloat("0x" + inverterPower)
      );
      this.setCapabilityValue(
        "measure_power.grid",
        this.parseFloat("0x" + gridPower)
      );
      this.setCapabilityValue(
        "measure_power.house",
        this.parseFloat("0x" + housePower)
      );

      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
    } catch (error) {
      this.error("Fehler bei der Abfrage des Batterie-Status", error);
    }
  }

  parseFloat(str) {
    var float = 0,
      sign,
      order,
      mantissa,
      exp,
      int = 0,
      multi = 1;
    if (/^0x/.exec(str)) {
      int = parseInt(str, 16);
    } else {
      for (var i = str.length - 1; i >= 0; i -= 1) {
        if (str.charCodeAt(i) > 255) {
          console.log("Wrong string parameter");
          return false;
        }
        int += str.charCodeAt(i) * multi;
        multi *= 256;
      }
    }
    sign = int >>> 31 ? -1 : 1;
    exp = ((int >>> 23) & 0xff) - 127;
    mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
    for (i = 0; i < mantissa.length; i += 1) {
      float += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0;
      exp--;
    }
    return float * sign;
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log("MyDevice has been added");
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
    this.log("MyDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log("MyDevice was renamed");
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log("MyDevice has been deleted");

    // Wenn das Gerät gelöscht wird, stoppe das Intervall
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
}

module.exports = MyDevice;
