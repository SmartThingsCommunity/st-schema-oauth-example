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
      case 'supportedButtonValues':
        return 'st.button';
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
      case 'airConditionerMode':
        return 'st.airConditionerMode';
      case 'supportedAcModes':
        return 'st.airConditionerMode';
      case 'supportedThermostatModes':
        return 'st.thermostatMode';
      case 'supportedThermostatFanModes':
        return 'st.thermostatFanMode';
      case 'supportedWindowShadeCommands':
        return 'st.windowShade';
      case 'power':
        return 'st.powerMeter';
      case 'energy':
        return 'st.energyMeter';
      case 'gasMeter':
      case 'gasMeterCalorific':
      case 'gasMeterConversion':
      case 'gasMeterVolume':
      case 'gasMeterPrecision':
      case 'gasMeterTime':
        return 'st.gasMeter';
      case 'smoke':
        return 'st.smokeDetector';
      case 'water':
        return 'st.waterSensor';
      case 'carbonMonoxide':
        return 'st.carbonMonoxideDetector';
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
  stStatesFor(externalStates, allExternalStates = {}, command = false) {
    const temperatureUnit = allExternalStates.temperatureScale || 'F';
    const states = Object.keys(externalStates).map(key => {
      const component = stComponent(key);
      const name = stAttribute(key);
      if (name === 'airConditionerMode') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key])
        }
      } else if (name === 'lock') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          data: {method: command ? 'command' : 'manual'}
        }
      } else if (name === 'thermostatMode') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          data: {supportedThermostatModes: allExternalStates['supportedThermostatModes'] || this.supportedThermostatModes()} // TODO
        }
      } else if (name === 'thermostatFanMode') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          data: {supportedThermostatFanModes: allExternalStates['supportedThermostatFanModes'] || this.supportedThermostatFanModes()} // TODO
        }
      } else if (name === 'temperature') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: temperatureUnit
        }
      } else if (name === 'heatingSetpoint') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: temperatureUnit
        }
      } else if (name === 'coolingSetpoint') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: temperatureUnit
        }
      } else if (name === 'power') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: 'W'
        }
      } else if (name === 'energy') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: 'kWh'
        }
      } else if (name === 'outputVoltage') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: 'V'
        }
      } else if (name === 'customColorTemp') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
          unit: 'K',
          data: {range: [2800, 6000]}
        }
      } else if (name === 'outputModulation') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key])
        }
      } else if (name !== 'temperatureScale') {
        return {
          component: component,
          capability: this.stCapabilityFor(name),
          attribute: this.stAttributeFor(name),
          value: this.stValueFor(name, externalStates[key]),
        }
      }
    });
    /*
    if (states.length === 1 && states[0].attribute === 'heatingSetpoint') {
      states.push({
        component: 'main',
        capability: 'st.thermostatMode',
        attribute: 'thermostatMode',
        value: 'heat',
        data: {supportedThermostatModes: allExternalStates['supportedThermostatModes'] || this.supportedThermostatModes()}
      })
    } else if (states.length === 1 && states[0].attribute === 'coolingSetpoint') {
      states.push({
        component: 'main',
        capability: 'st.thermostatMode',
        attribute: 'thermostatMode',
        value: 'cool',
        data: {supportedThermostatModes: allExternalStates['supportedThermostatModes'] || this.supportedThermostatModes()}
      })
    }
    */
    return states.filter(it => it)
  },

  /**
   * Returns map of external states from array of SmartThings commands
   * @param stCommands Map of ST commands
   * @returns {*|any[]} Map of ST states
   */
  externalStatesFor(stCommands) {
    const map = {};
    for (const it of stCommands) {
      switch (it.command) {
        case 'on':
          map[externalKey(it.component,'switch')] = 'on';
          break;
        case 'off':
          map[externalKey(it.component,'switch')] = 'off';
          break;
        case 'lock':
          map[externalKey(it.component,'lock')] = 'locked';
          break;
        case 'unlock':
          map[externalKey(it.component,'lock')] = 'unlocked';
          break;
        case 'setHue':
          map[externalKey(it.component,'hue')] = 360 * it['arguments'][0] / 100;
          break;
        case 'setLevel':
          map[externalKey(it.component, 'brightness')] = it['arguments'][0];
          break;
        case 'setColor':
          map[externalKey(it.component, 'hue')] = 360 * it['arguments'][0].hue / 100;
          map[externalKey(it.component, 'saturation')] = it['arguments'][0].saturation;
          break;
        case 'open':
          if (it.capability === 'st.windowShade') {
            map[externalKey(it.component, 'windowShade')] = 'open';
          } else {
            map[externalKey(it.component, 'valve')] = 'open';
          }
          break;
        case 'close':
          if (it.capability === 'st.windowShade') {
            map[externalKey(it.component,'windowShade')] = 'closed';
          } else {
            map[externalKey(it.component, 'valve')] = 'open';
          }
          break;
        case 'pause':
          map[externalKey(it.component,'windowShade')] = 'partially open';
          break;
        case 'presetPosition':
          map[externalKey(it.component,'windowShade')] = 'partially open';
          break;
        case 'reset':
          map[externalKey(it.component,'windowShade')] = 'partially open';
          break;
        default:
          let attribute = it.command.replace(/^set/, '');
          attribute = attribute.charAt(0).toLowerCase() + attribute.slice(1);
          map[externalKey(it.component, attribute)] = it['arguments'][0];
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
    return Object.keys(deviceTypesByName).sort()
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

  supportedAcModes() {
    return ["cool", "dry", "fanOnly"]
  },

  /**
   * Returns list of thermostat fan modes for thermostat devices
   * @returns {string[]}
   */
  supportedThermostatFanModes() {
    return ['auto', 'on']
  },

  handlerType(key) {
    const entry = deviceTypes[key];
    if (entry.deviceProfile) {
      return entry.deviceProfile
    }
    return key
  },

  isTemperatureAttribute(name) {
    return ['temperature', 'heatingSetpoint', 'coolingSetpoint', 'refrigerationSetpoint'].includes(name)
  },

  missingTemperatureScale(states) {
    let hasTemperatureAttribute = false;
    let hasTemperatureScale = false;
    for (const name of Object.keys(states)) {
      if (this.isTemperatureAttribute(name)) {
        hasTemperatureAttribute = true
      } else if (name === 'temperatureScale') {
        hasTemperatureScale = true
      }
    }
    return hasTemperatureAttribute && !hasTemperatureScale;
  }
};

function externalKey(component, attribute) {
  if (component === 'main') {
    return attribute;
  }
  else {
    return `${component}_${attribute}`
  }
}

function stComponent(externalKey) {
  if (externalKey.includes('_')) {
    return externalKey.split('_')[0]
  }
  else {
    return 'main';
  }
}

function stAttribute(externalKey) {
  if (externalKey.includes('_')) {
    return externalKey.split('_')[1]
  }
  else {
    return externalKey;
  }
}
