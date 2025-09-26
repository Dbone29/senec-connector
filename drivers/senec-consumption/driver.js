'use strict';

const Homey = require('homey');

class SenecConsumptionDriver extends Homey.Driver {

  async onInit() {
    this.log('SenecConsumptionDriver has been initialized');
  }

  async onPairListDevices() {
    return [
      {
        name: 'SENEC Home Consumption',
        data: {
          id: 'senec-consumption-main'
        }
      }
    ];
  }

}

module.exports = SenecConsumptionDriver;