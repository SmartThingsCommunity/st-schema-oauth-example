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
  "7a004f0c-db94-44d7-b206-c53866a9b745": {
    "name": "Air Conditioner",
    "states": {
      "online": true,
      "temperature": 72,
      "coolingSetpoint": 74,
      "thermostatFanMode": "auto"
    }
  },
  "5e5b9338-4ac5-4b35-a0b3-fb97a6787fa5": {
    "name": "Heater",
    "states": {
      "online": true,
      "temperature": 72,
      "heatingSetpoint": 70,
      "thermostatOperatingState": "idle"
    }
  },
  "f37767e0-496d-4df8-9119-3f68c0646c59": {
    "name": "HVAC Thermostat",
    "states": {
      "online": true,
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
  }
};
