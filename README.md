# Senec Connector

A Homey app that integrates Senec battery storage systems with your Homey smart home platform. Monitor your battery status, power flows, and control charging modes directly from Homey.

## Features

- **Real-time monitoring** of battery status and power flows
- **Force charging control** to manually charge your battery
- **Multiple power measurements**:
  - Battery charge level (%)
  - Battery voltage (V)
  - Battery current (A)
  - Battery power (W)
  - Inverter power (W)
  - Grid power (W) - positive values indicate grid consumption, negative values indicate feed-in
  - House power consumption (W)
- **Automatic status updates** every 3 seconds
- **LAN connectivity** for reliable local communication

## Requirements

- Homey Pro or Homey Bridge
- Senec battery system with network connectivity
- IP address of your Senec battery system

## Installation

### Development Mode
1. Install npm packages:
```bash
npm install
```

2. Run the app in development mode:
```bash
homey app run
```

### Production Installation
Install the app on your Homey device:
```bash
homey app install
```

## Configuration

1. Add a new Senec battery device in Homey
2. Enter the IP address of your Senec battery system during pairing
3. The device will automatically start polling for status updates

## Capabilities Explained

| Capability | Description | Unit |
|------------|-------------|------|
| On/Off | Controls force charging mode. When ON, battery charges from grid. When OFF, normal operation. | - |
| Battery Level | Current battery charge percentage | % |
| Voltage | Battery voltage | V |
| Current | Battery current (positive = charging, negative = discharging) | A |
| Battery Power | Power flow to/from battery (positive = charging, negative = discharging) | W |
| Inverter Power | Power output from the inverter | W |
| Grid Power | Power flow from/to grid (positive = consuming, negative = feeding) | W |
| House Power | Total house power consumption | W |

## Troubleshooting

- **Device not responding**: Verify the IP address is correct and the Senec system is reachable on your network
- **SSL certificate errors**: The app automatically handles self-signed certificates from Senec systems
- **Incorrect values**: Ensure your Senec firmware is up to date

## Development

### Linting
Check code quality:
```bash
npm run lint
```

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Author

Daniel Busenius - [info@daniel-b.de](mailto:info@daniel-b.de)