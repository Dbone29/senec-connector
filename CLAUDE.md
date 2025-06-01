# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Homey app that adds support for Senec batteries. It's built using the Homey SDK v3 and communicates with Senec battery systems via HTTPS API calls.

## Development Commands

### Running the App
- `homey app run` - Run the app in development mode
- `homey app install` - Install the app on your Homey device

### Code Quality
- `npm run lint` - Run ESLint to check code quality (uses eslint-config-athom)

## Architecture

### Main Components
- **app.js**: Main application entry point (SenecApp class)
- **drivers/senec-battery/driver.js**: Handles device pairing via IP address input
- **drivers/senec-battery/device.js**: Core device logic including:
  - Polling battery status every 3 seconds
  - Managing force charging and discharge modes
  - Parsing float values from hex strings
  - Updating device capabilities with battery metrics

### Key Capabilities
The Senec battery device supports these capabilities:
- `onoff` - Controls force charging mode
- `measure_battery` - Battery charge percentage
- `measure_current` - Battery current
- `measure_power.battery` - Battery power
- `measure_power.grid` - Grid power
- `measure_power.house` - House power consumption
- `measure_power.inverter` - Inverter power
- `measure_voltage` - Battery voltage

### API Communication
- Uses HTTPS POST requests to `https://{ipAddress}/lala.cgi`
- Disables TLS certificate validation for self-signed certificates
- Sends JSON payloads to query status or control charging modes
- Parses hex-encoded float values from API responses