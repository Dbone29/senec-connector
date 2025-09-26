'use strict';

const Homey = require('homey');

class SenecSolarDevice extends Homey.Device {

  async onInit() {
    this.log('SenecSolarDevice has been initialized');

    // Initialize cumulative energy meter
    this.totalSolarGenerated = this.getCapabilityValue('meter_power') || 0;
    this.lastPowerUpdate = Date.now();

    // Listen for data updates from main battery device
    this.homey.app.on('senec-data', (data) => {
      this.updateSolarData(data);
    });
  }

  updateSolarData(data) {
    if (!data.inverterPower) return;

    const inverterPower = Math.max(0, data.inverterPower); // Only positive values for solar

    // Update current power
    this.setCapabilityValue('measure_power', inverterPower).catch(this.error);

    // Update cumulative energy meter
    this.updateEnergyMeter(inverterPower);
  }

  updateEnergyMeter(solarPower) {
    const now = Date.now();
    const timeDiffSeconds = (now - this.lastPowerUpdate) / 1000;
    this.lastPowerUpdate = now;

    // Calculate energy in kWh (Power in W * time in hours)
    const energyKwh = solarPower * (timeDiffSeconds / 3600) / 1000;

    // Add to total generated energy (must only increase)
    this.totalSolarGenerated += energyKwh;
    this.setCapabilityValue('meter_power', this.totalSolarGenerated).catch(this.error);
  }

  async onAdded() {
    this.log('SenecSolarDevice has been added');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('SenecSolarDevice settings where changed');
  }

  async onRenamed(name) {
    this.log('SenecSolarDevice was renamed');
  }

  async onDeleted() {
    this.log('SenecSolarDevice has been deleted');
  }

}

module.exports = SenecSolarDevice;