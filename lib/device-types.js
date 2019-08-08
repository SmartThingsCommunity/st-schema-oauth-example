'use strict';

const AC_THERMOSTAT = process.env.AC_THERMOSTAT;
const HEATING_THERMOSTAT = process.env.HEATING_THERMOSTAT;
const HVAC_THERMOSTAT = process.env.HVAC_THERMOSTAT;
const POwER_SUPPLY =  process.env.POWER_SUPPLY;

module.exports = {
  "c2c-switch": {
    "name": "Switch",
    "states": {
      "online": true,
      "switch": "off"
    }
  },
  "c2c-dimmer": {
    "name": "Dimmer",
    "states": {
      "online": true,
      "switch": "off",
      "brightness": 100
    }
  },
  "c2c-color-temperature-bulb": {
    "name": "Tunable White Bulb",
    "states": {
      "online": true,
      "switch": "off",
      "brightness": 100,
      "colorTemperature": 3000
    }
  },
  "c2c-motion-2": {
    "name": "Motion Sensor",
    "states": {
      "online": true,
      "motion": "inactive",
      "battery": 100
    }
  },
  "c2c-motion": {
    "name": "Motion & Temperature",
    "states": {
      "online": true,
      "motion": "inactive",
      "temperature": 78
    }
  },
  "c2c-motion-5": {
    "name": "Motion, Temperature & Illuminance",
    "states": {
      "online": true,
      "motion": "inactive",
      "battery": 100,
      "temperature": 76,
      "illuminance": 800
    }
  },
  "c2c-contact-3": {
    "name": "Open/Close Sensor",
    "states": {
      "online": true,
      "contact": "closed",
      "battery": 100
    }
  },
  "c2c-rgb-color-bulb": {
    "name": "Color Bulb",
    "states": {
      "online": true,
      "switch": "off",
      "brightness": 100,
      "hue": 0,
      "saturation": 0
    }
  },
  "c2c-rgbw-color-bulb": {
    "name": "Color & Tunable White Bulb ",
    "states": {
      "online": true,
      "switch": "off",
      "brightness": 100,
      "colorTemperature": 3000,
      "hue": 0,
      "saturation": 0
    }
  },
  [AC_THERMOSTAT]: {
    "name": "Air Conditioner",
    "states": {
      "temperature": 72,
      "coolingSetpoint": 74,
      "thermostatMode": "cool",
      "thermostatFanMode": "auto",
      "thermostatOperatingState": "idle",
      "supportedThermostatModes": [
        "off",
        "cool"
      ],
      "supportedThermostatFanModes": [
        "auto",
        "on"
      ]
    }
  },
  [HEATING_THERMOSTAT]: {
    "name": "Heater",
    "states": {
      "temperature": 72,
      "heatingSetpoint": 70,
      "thermostatMode": "heat",
      "thermostatOperatingState": "idle",
      "supportedThermostatModes": [
        "off",
        "heat"
      ]
    }
  },
  [HVAC_THERMOSTAT]: {
    "name": "HVAC Thermostat",
    "states": {
      "temperature": 72,
      "heatingSetpoint": 68,
      "coolingSetpoint": 74,
      "thermostatMode": "off",
      "thermostatFanMode": "auto",
      "thermostatOperatingState": "idle",
      "supportedThermostatModes": [
        "off",
        "heat",
        "cool",
        "auto"
      ],
      "supportedThermostatFanModes": [
        "auto",
        "on"
      ]
    }
  },
  'c2c-switch-power-energy': {
    "name": "Switch Power/Energy",
    "states": {
      "online": true,
      "switch": "off",
      "power": 0,
      "energy": 0
    }
  },
  'c2c-valve': {
    "name": "Valve",
    "states": {
      "online": true,
      "valve": "closed"
    }
  },
  [POwER_SUPPLY]: {
    "name": "Power Supply",
    "states": {
      "online": true,
      "switch": "off",
      "outputVoltage": 120,
      "outputModulation": "60hz"
    }
  }
};
