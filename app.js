'use strict';

const Homey = require('homey');

class SenecApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('SenecApp has been initialized');
  }

}

module.exports = SenecApp;
