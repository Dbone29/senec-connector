'use strict';

const { Driver } = require('homey');

class SenecDriver extends Driver {

  onInit() {
    this.log('SenecDriver initialized');
  }

  async onPair(session) {
    session.setHandler('check_ip_event', async (data) => {
      if (
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
          data.ip,
        )
      ) {
        // TODO: replace with mac
        session.emit('save_device', { mac: data.ip, ip: data.ip });
        return null;
      }
      return 'Invalid IP-address!';
    });
  }

}

module.exports = SenecDriver;
