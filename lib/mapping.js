'use strict';

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
      case 'thermostatMode':
        return 'st.thermostatMode';
      case 'thermostatFanMode':
        return 'st.thermostatFanMode';
      case 'thermostatOperatingState':
        return 'st.thermostatOperatingState';
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
      case 'switch':
        return 'switch';
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
   * @param externalStates Map of external state values
   * @returns {any[]} Map of ST state values
   */
  stStatesFor(externalStates) {
    const states = Object.keys(externalStates).map(key => {
      if (key === 'thermostatMode') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          data: {supportedThermostatModes: this.supportedThermostatModes()}
        }
      } else if (key === 'thermostatFanMode') {
        return {
          component: 'main',
          capability: this.stCapabilityFor(key),
          attribute: this.stAttributeFor(key),
          value: this.stValueFor(key, externalStates[key]),
          data: {supportedThermostatFanModes: this.supportedThermostatFanModes()}
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

  /**
   * Returns ST states refresh map for external cloud's state values. Differs from stStatesFor in that it includes
   * supportedThermostatModes and supportedThermostatFanModes if appropriate.
   *
   * @param externalStates Map of external states
   * @returns {*|any[]} Map of ST states
   */
  stRefreshStatesFor(externalStates) {
    const states = this.stStatesFor(externalStates);

    if (states.find(it => { return it.attribute === 'thermostatMode'})) {
      states.push({
        component: 'main',
        capability: 'st.thermostatMode',
        attribute: 'supportedThermostatModes',
        value: this.supportedThermostatModes()
      })
    }

    if (states.find(it => { return it.attribute === 'thermostatFanMode'})) {
      states.push({
        component: 'main',
        capability: 'st.thermostatFanMode',
        attribute: 'supportedThermostatFanModes',
        value: this.supportedThermostatFanModes()
      })
    }

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
    let result;
    switch (deviceType) {
      case 'c2c-switch':
        result = {switch: 'off'};
        break;
      case 'c2c-dimmer':
        result = {switch: 'off', brightness: 100};
        break;
      case 'c2c-color-temperature-bulb':
        result = {switch: 'off', brightness: 100, colorTemperature: 3000};
        break;
      case 'c2c-motion-2':
        result = {motion: 'inactive', battery: 100};
        break;
      case 'c2c-motion-5':
        result = {motion: 'inactive', battery: 100, temperature: 76, illuminance: 800};
        break;
      case 'd51dc1d9-d309-4200-ae45-452c91d41d7c':
        result = {motion: 'inactive', temperature: 78};
        break;
      case 'c2c-contact-3':
        result = {contact: 'closed', battery: 100};
        break;
      case 'c2c-rgb-color-bulb':
        result = {switch: 'off', brightness: 100, hue: 0, saturation: 0};
        break;
      case 'c2c-rgbw-color-bulb':
        result = {switch: 'off', brightness: 100, colorTemperature: 3000, hue: 0, saturation: 0};
        break;
      case '7a004f0c-db94-44d7-b206-c53866a9b745':
        result = {
          temperature: 72,
          coolingSetpoint: 74,
          thermostatFanMode: 'auto'
        };
        break;
      case 'f3273146-84e3-4950-bb55-0ef1058c3858':
        result = {
          temperature: 72,
          coolingSetpoint: 74,
          thermostatFanMode: 'auto'
        };
        break;
      case '5e5b9338-4ac5-4b35-a0b3-fb97a6787fa5':
        result = {
          temperature: 72,
          heatingSetpoint: 70,
          thermostatOperatingState: 'idle'
        };
        break;
      case 'f37767e0-496d-4df8-9119-3f68c0646c59':
        result = {
          temperature: 72,
          heatingSetpoint: 68,
          coolingSetpoint: 74,
          thermostatMode: 'off',
          thermostatFanMode: 'auto',
          thermostatOperatingState: 'idle'
        };
        break;
      default:
        result = {};
        break;
    }
    result.online = true;
    return result;
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