'use strict';

const Homey = require('homey');

class SenecConsumptionDevice extends Homey.Device {

  async onInit() {
    this.log('SenecConsumptionDevice has been initialized');

    // Initialize cumulative energy meter
    this.totalConsumption = this.getCapabilityValue('meter_power') || 0;
    this.lastPowerUpdate = Date.now();

    // Listen for data updates from main battery device
    this.homey.app.on('senec-data', (data) => {
      this.updateConsumptionData(data);
    });
  }

  updateConsumptionData(data) {
    if (!data.housePower) return;

    const housePower = Math.max(0, data.housePower); // Only positive values for consumption

    // Update current power
    this.setCapabilityValue('measure_power', housePower).catch(this.error);

    // Update cumulative energy meter
    this.updateEnergyMeter(housePower);
  }

  updateEnergyMeter(consumptionPower) {
    const now = Date.now();
    const timeDiffSeconds = (now - this.lastPowerUpdate) / 1000;
    this.lastPowerUpdate = now;

    // Calculate energy in kWh (Power in W * time in hours)
    const energyKwh = consumptionPower * (timeDiffSeconds / 3600) / 1000;

    // Add to total consumption (must only increase)
    this.totalConsumption += energyKwh;
    this.setCapabilityValue('meter_power', this.totalConsumption).catch(this.error);
  }

  async onAdded() {
    this.log('SenecConsumptionDevice has been added');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('SenecConsumptionDevice settings where changed');
  }

  async onRenamed(name) {
    this.log('SenecConsumptionDevice was renamed');
  }

  async onDeleted() {
    this.log('SenecConsumptionDevice has been deleted');
  }

}

module.exports = SenecConsumptionDevice;