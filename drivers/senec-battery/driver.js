'use strict';

const { Driver } = require('homey');

class SenecDriver extends Driver {
    onInit() {
        this.log('SenecDriver initialized');
    }

    // onPairListDevices verwendet jetzt Promises statt Callback
    onPairListDevices(data) {
        return new Promise((resolve, reject) => {
            const devices = [
                {
                    name: 'Senec Battery',
                    data: { id: 'static-senec-id' },
                    settings: { ipAddress: '192.168.4.20' }, // Beispiel-IP-Adresse
                },
            ];

            // Rückgabe des Geräts
            resolve(devices);
        });
    }

    // Dies wird nach dem Auswählen des Geräts ausgeführt
    onPairDevice(deviceData) {
        this.log('Device selected:', deviceData);

        // Wir setzen das Gerät für das Pairing
        this.pairing.setDevice(deviceData);

        // Beende das Pairing und zeige den nächsten Schritt (z. B. Done Button)
        return this.pairing.done();
    }
}

module.exports = SenecDriver;