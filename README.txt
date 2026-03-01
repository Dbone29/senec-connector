Monitor and control your SENEC battery storage system directly from Homey.

Features:
- Real-time monitoring of battery status, solar production, grid power, and home consumption
- Force charging control to manually charge your battery from the grid
- Energy Tab integration with cumulative energy meters
- Automatic status updates every 3 seconds via LAN

Supported devices:
- SENEC Battery: Battery charge level, voltage, current, power, and force charging control
- SENEC Solar/Inverter: Solar power production and cumulative energy generated
- SENEC Grid Connection: Grid import/export power and cumulative energy meters
- SENEC Home Consumption: House power consumption and cumulative energy usage

Requirements:
- Homey Pro with firmware 12.0 or higher
- SENEC battery system with network connectivity
- IP address of your SENEC system

Setup:
1. Add the SENEC Battery device and enter the IP address of your SENEC system
2. Add the Solar, Grid, and Consumption devices for additional monitoring
3. All devices will automatically start receiving data
