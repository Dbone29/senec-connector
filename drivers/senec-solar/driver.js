'use strict';

const Homey = require('homey');

class SenecSolarDriver extends Homey.Driver {

  async onInit() {
    this.log('SenecSolarDriver has been initialized');
  }

  async onPairListDevices() {
    return [
      {
        name: 'SENEC Solar/Inverter',
        data: {
          id: 'senec-solar-main'
        }
      }
    ];
  }

}

module.exports = SenecSolarDriver;