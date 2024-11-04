"use strict";

const Homey = require("homey");

class MyDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log("MyDriver has been initialized");
  }

  async onPair(session) {
    session.setHandler("my_event", async function (data) {
      // data is { 'foo': 'bar' }
      return "Hello!";
    });
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  /*async onPairListDevices() {

    return [
      // Example device data, note that `store` is optional
      {
        name: "Senec Battery",
        data: {
          id: "senec-battery-01",
        },
        store: {
          address: "192.168.4.20",
        },
      },
    ];
  }*/
}

module.exports = MyDriver;
