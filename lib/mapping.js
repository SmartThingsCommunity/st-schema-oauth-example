'use strict';

const deviceTypes = require('./device-types');
const deviceTypesByName = Object.keys(deviceTypes).reduce((map, it) => {
  const item = deviceTypes[it];
  item.type = it;
  map[item.name] = item;
  return map
}, {});

/**
 * Methods for mapped between SmartThings and external cloud's definition of attributes and commands.
 */
module.exports = {

  /**
   * Returns ST capability for spefified external attribute name
   * @param name External attribute name
   * @returns {string} ST Schema capability name for that attribugte
   */


  stCapabilityFor(name) {
    switch (name) {
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
      case 'illuminance':
        return 'st.illuminanceMeasurement';
      case 'heatingSetpoint':
        return 'st.thermostatHeatingSetpoint';
      case 'coolingSetpoint':
        return 'st.thermostatCoolingSetpoint';
      case 'temperature':
        return 'st.temperatureMeasurement';
      case 'supportedThermostatModes':
        return 'st.thermostatMode';
      case 'supportedThermostatFanModes':
        return 'st.thermostatFanMode';
      case 'power':
        return 'st.powerMeter';
      case 'energy':
        return 'st.energyMeter';
      case 'outputVoltage':
        return 'bobdemo.outputVoltage';
      case 'outputModulation':
        return 'bobdemo.outputModulation';

      default:
        return 'st.' + name;
    }
  },

  /**
   * Returns ST attribute name for specified external attribute name
   * @param name External attribute name
   * @returns {string|*} ST Schema attribute name
   */
  stAttributeFor(name) {
    switch (name) {
      case 'brightness':
        return 'level';
      case 'online':
        return 'healthStatus';
      default:
        return name
    }
  },

  /**
   * Returns ST value for external attribute value
   *
   * @param name External attribute name
   * @param value External attribute value
   * @returns {string|number|*} SmartThings attribute value
   */
  stValueFor(name, value) {
    switch (name) {
      case 'hue':
        return 100 * value / 360;
      case 'online':
        return value ? 'online': 'offline';
      default:
        return value
    }
  },

  /**
   * Returns ST states map for external cloud's state values
   * @param externalStates Map of external state values to be converted
   * @param externalStates Map of all the devices external state values, for use in cross-referencing
   * @returns {any[]} Map of ST state values
   */
  stStatesFor(externalStates, allExternalStates = {}) {
    const states = Object.keys(externalStates).map(key => {
      if (key === 'thermostatMode') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          data: {supportedThermostatModes: allExternalStates['supportedThermostatModes'] || this.supportedThermostatModes()}
        }
      } else if (key === 'thermostatFanMode') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          data: {supportedThermostatFanModes: allExternalStates['supportedThermostatFanModes'] || this.supportedThermostatFanModes()}
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
      } else if (key === 'power') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          unit: 'W'
        }
      } else if (key === 'energy') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          unit: 'kWh'
        }
      } else if (key === 'outputVoltage') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          unit: 'V'
        }
      } else {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
        }
      }
    });
    return states
  },

  /**
   * Returns map of external states from array of SmartThings commands
   * @param stCommands Map of ST commands
   * @returns {*|any[]} Map of ST states
   */
  externalStatesFor(stCommands) {
    const map = {}
    for (const it of stCommands) {
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
        case 'setColor':
          map.hue = 360 * it.arguments[0].hue / 100;
          map.saturation = it.arguments[0].saturation;
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

  /**
   * Returns the initial external states for an ST device type
   * @param deviceType ST device type or device profile ID
   * @returns {{heatingSetpoint: number, thermostatOperatingState: string, temperature: number}|{switch: string}|{saturation: number, brightness: number, hue: number, switch: string, colorTemperature: number}|{}|{motion: string, illuminance: number, temperature: number, battery: number}|{brightness: number, switch: string, colorTemperature: number}|{motion: string, temperature: number}|{motion: string, battery: number}|{coolingSetpoint: number, temperature: number, thermostatFanMode: string}|{heatingSetpoint: number, coolingSetpoint: number, thermostatOperatingState: string, temperature: number, thermostatFanMode: string, thermostatMode: string}|{saturation: number, brightness: number, hue: number, switch: string}|{contact: string, battery: number}|{brightness: number, switch: string}}
   */
  statesForDeviceType(deviceType) {
    return deviceTypes[deviceType].state
  },

  deviceTypeNames() {
    return Object.keys(deviceTypes).map(it => {return deviceTypes[it].name}).sort()
  },

  deviceTypeForName(name) {
    return deviceTypesByName[name]
  },

  /**
   * Returns list of thermostat modes for thermostat devices
   * @returns {string[]}
   */
  supportedThermostatModes() {
    return ['off', 'heat', 'cool', 'auto']
  },

  /**
   * Returns list of thermostat fan modes for thermostat devices
   * @returns {string[]}
   */
  supportedThermostatFanModes() {
    return ['auto', 'on']
  }
}
