'use strict';

const thermostat = require('./thermostat');

module.exports = {

  stCapabilityFor(key) {
    switch (key) {
      case 'switch':
        return 'st.switch';
      case 'brightness':
        return 'st.switchLevel';
      case 'hue':
      case 'saturation':
        return 'st.colorControl';
      case 'colorTemperature':
        return 'st.colorTemperature';
      case 'online':
        return 'st.healthCheck';
      case 'contact':
        return 'st.contactSensor';
      case 'motion':
        return 'st.motionSensor';
      case 'heatingSetpoint':
        return 'st.thermostatHeatingSetpoint';
      case 'coolingSetpoint':
        return 'st.thermostatCoolingSetpoint';
      case 'temperature':
        return 'st.temperatureMeasurement';
      case 'thermostatMode':
        return 'st.thermostatMode';
      case 'thermostatFanMode':
        return 'st.thermostatFanMode';
      case 'thermostatOperatingState':
        return 'st.thermostatOperatingState';
      default:
        return 'st.' + key;
    }
  },

  stAttributeFor(key) {
    switch (key) {
      case 'switch':
        return 'switch';
      case 'brightness':
        return 'level';
      case 'online':
        return 'healthStatus';
      default:
        return key
    }
  },

  stValueFor(key, value) {
    switch (key) {
      case 'hue':
        return 100 * value / 360;
      case 'online':
        return value ? 'online': 'offline';
      default:
        return value
    }
  },

  stStatesFor(externalStates) {
    const states = Object.keys(externalStates).map(key => {
      if (key === 'thermostatMode') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          data: thermostat.supportedThermostatModes()
        }
      } else if (key === 'thermostatFanMode') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          data: thermostat.supportedThermostatFanModes()
        }
      } else if (key === 'temperature') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          unit: 'F'
        }
      } else if (key === 'heatingSetpoint') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          unit: 'F'
        }
      } else if (key === 'coolingSetpoint') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          unit: 'F'
        }
      } else {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key])
        }
      }
    });
    return states
  },

  stRefreshStatesFor(externalStates) {
    const states = this.stStatesFor(externalStates)

    if (states.includes(it => { return it.attribute === 'thermostatMode'})) {
      states.push({
        component: 'main',
        capability: 'st.thermostatMode',
        attribute: 'supportedThermostatModes',
        value: thermostat.supportedThermostatModes()
      })
    }

    if (states.includes(it => { return it.attribute === 'thermostatFanMode'})) {
      states.push({
        component: 'main',
        capability: 'st.thermostatFanMode',
        attribute: 'supportedThermostatFanModes',
        value: thermostat.supportedThermostatFanModes()
      })
    }

    return states
  },

  externalStatesFor(stStates) {
    const map = {}
    for (const it of stStates) {
      switch (it.command) {
        case 'on':
          map['switch'] = 'on';
          break;
        case 'off':
          map['switch'] = 'off';
          break;
        case 'setHue':
          map.hue = 360 * it.arguments[0] / 100;
          break;
        case 'setLevel':
          map.brightness = it.arguments[0];
          break;
        default:
          let attribute = it.command.replace(/^set/, '');
          attribute = attribute.charAt(0).toLowerCase() + attribute.slice(1);
          map[attribute] = it.arguments[0];
          break
      }
    }
    return map
  },

  statesForDeviceType(deviceType) {
    switch (deviceType) {
      case 'c2c-switch':
        return {switch: 'off'}
      case 'c2c-dimmer':
        return {switch: 'off', brightness: 100}
      case 'c2c-color-temperature-bulb':
        return {switch: 'off', brightness: 100, colorTemperature: 3000}
      case 'c2c-motion-2':
        return {motion: 'inactive', battery: 100}
      case 'c2c-contact-3':
        return {contact: 'closed', battery: 100}
      case 'c2c-rgb-color-bulb':
        return {switch: 'off', brightness: 100, hue: 0, saturation: 0}
      case 'c2c-rgbw-color-bulb':
        return {switch: 'off', brightness: 100, colorTemperature: 3000, hue: 0, saturation: 0}
      case 'f37767e0-496d-4df8-9119-3f68c0646c59':
        return {
          temperature: 72,
          heatingSetpoint: 68,
          coolingSetpoint: 74,
          thermostatMode: 'off',
          thermostatFanMode: 'auto',
          thermostatOperatingState: 'idle'
        };
      default:
        return {}
    }
  }
}