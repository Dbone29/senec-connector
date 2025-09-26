'use strict';

const Homey = require('homey');

class SenecGridDriver extends Homey.Driver {

  async onInit() {
    this.log('SenecGridDriver has been initialized');
  }

  async onPairListDevices() {
    return [
      {
        name: 'SENEC Grid Connection',
        data: {
          id: 'senec-grid-main'
        }
      }
    ];
  }

}

module.exports = SenecGridDriver;