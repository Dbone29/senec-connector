'use strict';

const Homey = require('homey');

class SenecGridDevice extends Homey.Device {

  async onInit() {
    this.log('SenecGridDevice has been initialized');

    // Initialize cumulative energy meters
    this.totalImported = this.getCapabilityValue('meter_power.imported') || 0;
    this.totalExported = this.getCapabilityValue('meter_power.exported') || 0;
    this.lastPowerUpdate = Date.now();

    // Listen for data updates from main battery device
    this.homey.app.on('senec-data', (data) => {
      this.updateGridData(data);
    });
  }

  updateGridData(data) {
    if (data.gridPower === undefined) return;

    const gridPower = data.gridPower;

    // Update current power (positive = import, negative = export)
    this.setCapabilityValue('measure_power', gridPower).catch(this.error);

    // Update cumulative energy meters
    this.updateEnergyMeters(gridPower);
  }

  updateEnergyMeters(gridPower) {
    const now = Date.now();
    const timeDiffSeconds = (now - this.lastPowerUpdate) / 1000;
    this.lastPowerUpdate = now;

    // Calculate energy in kWh (Power in W * time in hours)
    const energyKwh = Math.abs(gridPower) * (timeDiffSeconds / 3600) / 1000;

    if (gridPower > 0) {
      // Importing from grid
      this.totalImported += energyKwh;
      this.setCapabilityValue('meter_power.imported', this.totalImported).catch(this.error);
    } else if (gridPower < 0) {
      // Exporting to grid
      this.totalExported += energyKwh;
      this.setCapabilityValue('meter_power.exported', this.totalExported).catch(this.error);
    }
  }

  async onAdded() {
    this.log('SenecGridDevice has been added');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('SenecGridDevice settings where changed');
  }

  async onRenamed(name) {
    this.log('SenecGridDevice was renamed');
  }

  async onDeleted() {
    this.log('SenecGridDevice has been deleted');
  }

}

module.exports = SenecGridDevice;