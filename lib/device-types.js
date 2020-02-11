'use strict';

const AIR_CONDITIONER = "82da5d6b-aedc-4ed5-81fb-9661e1e499a2";
const HEATING_THERMOSTAT = "c9a88e65-5707-4c43-af59-80bdef27f8f0";
const HVAC_THERMOSTAT = "96406249-c14c-4d0e-8dd2-f62fbe381e78";
const POWER_SUPPLY = "c890a957-1ea7-4dba-b98d-68518bcb9834";
const TWO_CHANNEL_OUTLET = "3c7e7257-c378-4a43-a8c5-760ff7e9b644";
const WINDOW_SHADE = "9938ef87-3167-40f1-a256-0e7efa9afdc3";
const WINDOW_SHADE_PRESET = "0a4f14c1-4702-4d25-accd-810eafa6c8df";
const UTILITY_METER = "dc1a5647-7f1e-465f-8a78-c541852c91ed";
const BUTTON = "3f3e6638-ab1f-4616-8ef7-82ddff2fd60b";
const LOCK = "05c8badd-3ac9-4c18-a80c-da435e9f6fe8";
const SMOKE_DETECTOR = "acd1deab-30d5-4297-a005-a1e6b14a7e9b";
const LEAK_DETECTOR = "ab2559eb-dcc3-43f1-b83f-e62375403f58";
const HVAC_WITH_LEGACY = "18f7d1fe-74c8-43f0-8669-4600f855a909";

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
      "temperature": 78,
      "temperatureScale": "F"
    }
  },
  "c2c-motion-5": {
    "name": "Motion, Temperature & Illuminance",
    "states": {
      "online": true,
      "motion": "inactive",
      "battery": 100,
      "temperature": 76,
      "temperatureScale": "F",
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
  "custom-air-conditioner": {
    "name": "Air Conditioner",
    "deviceProfile": AIR_CONDITIONER,
    "states": {
      "online": true,
      "temperature": 72,
      "coolingSetpoint": 74,
      "airConditionerMode": "cool",
      "thermostatOperatingState": "idle",
      "supportedAcModes": [
        "cool",
        "dry",
        "fanOnly"
      ],
      "switch": "off",
      "temperatureScale": "F"
    }
  },
  "custom-heating-thermostat": {
    "name": "Heater",
    "deviceProfile": HEATING_THERMOSTAT,
    "states": {
      "online": true,
      "temperature": 72,
      "heatingSetpoint": 70,
      "thermostatMode": "heat",
      "thermostatOperatingState": "idle",
      "supportedThermostatModes": [
        "off",
        "heat"
      ],
      "temperatureScale": "F"
    }
  },
  "custom-hvac-thermostat": {
    "name": "HVAC Thermostat",
    "deviceProfile": HVAC_THERMOSTAT,
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
      ],
      "temperatureScale": "F"
    }
  },
  "custom-hvac-with-legacy-thermostat": {
    "name": "HVAC Thermostat (w/ legacy)",
    "deviceProfile": HVAC_WITH_LEGACY,
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
      ],
      "temperatureScale": "F"
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
  "custom-two-channel-outlet": {
    "name": "Two Channel Outlet",
    "deviceProfile": TWO_CHANNEL_OUTLET,
    "states": {
      "online": true,
      "switch": "off",
      "outlet1_switch": "off",
      "outlet2_switch": "off"
    }
  },
  "custom-window-shade": {
    "name": "Window Shade",
    "deviceProfile": WINDOW_SHADE,
    "states": {
      "online": true,
      "windowShade": "closed",
      "supportedWindowShadeCommands": ["open","close"]
    }
  },
  "custom-window-shade-preset": {
    "name": "Window Shade (with Preset)",
    "deviceProfile": WINDOW_SHADE_PRESET,
    "states": {
      "online": true,
      "windowShade": "closed",
      "supportedWindowShadeCommands": ["open","close","pause"]
    }
  },
  "custom-utility-meter": {
    "name": "Utility Meter",
    "deviceProfile": UTILITY_METER,
    "states": {
      "power": 1500,
      "energy": 450,
      "gasMeter": 750,
      "gasMeterCalorific": 20,
      "gasMeterConversion": 15,
      "gasMeterVolume": 250,
      "gasMeterPrecision": {
        "volume": 1,
        "calorific": 1,
        "conversion": 1
      },
      "gasMeterTime": new Date().toISOString(),
      "online": true
    }
  },
  "custom-button": {
    "deviceProfile": BUTTON,
    "name": "Button",
    "states": {
      "online": true,
      "button": "held",
      "supportedButtonValues": [
        "pushed",
        "held",
        "double"
      ]
    }
  },
  "custom-lock": {
    "deviceProfile": LOCK,
    "name": "Lock",
    "states": {
      "lock": "unlocked",
      "online": true
    }
  },
  "custom-smoke-co-detector": {
    "deviceProfile": SMOKE_DETECTOR,
    "name": "Smoke & CO Detector",
    "states": {
      "smoke": "clear",
      "carbonMonoxide": "clear",
      "online": true
    }
  },
  "custom-leak-detector": {
    "deviceProfile": LEAK_DETECTOR,
    "name": "Leak Detector",
    "states": {
      "water": "dry",
      "online": true
    }
  }
};
