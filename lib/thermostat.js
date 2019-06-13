
module.exports = {

  hvacOperatingState(params) {
    const temperature = params.temperature;
    const operatingState = params.thermostatOperatingState.value;
    const heatingSetpoint = params.heatingSetpoint;
    const coolingSetpoint = params.coolingSetpoint.value;
    const mode = params.thermostatMode;

    let newOperatingState = operatingState;

    if (mode === 'heat') {
      if (temperature < heatingSetpoint) {
        if (operatingState !== 'heating') {
          newOperatingState = 'heating';
        }
      }
      else if (operatingState !== 'idle') {
        newOperatingState = 'idle';
      }
    }
    else if (mode === 'cool') {
      if (temperature > coolingSetpoint) {
        if (operatingState !== 'cooling') {
          newOperatingState = 'cooling';
        }
      }
      else if (operatingState !== 'idle') {
        newOperatingState = 'idle';
      }
    }
    else if (mode === 'off') {
      if (operatingState !== 'idle') {
        newOperatingState = 'idle';
      }
    }
    else if (mode === 'auto') {
      if (temperature < heatingSetpoint) {
        if (operatingState !== 'heating') {
          newOperatingState = 'heating';
        }
      }
      else if (temperature > coolingSetpoint) {
        if (operatingState !== 'cooling') {
          newOperatingState = 'cooling';
        }
      }
      else if (operatingState !== 'idle') {
        newOperatingState = 'idle';
      }
    }

    return newOperatingState;
  },

  adjustedHeatingSetpoint(heatingSetpoint, coolingSetpoint) {
    let newHeatingSetpoint = heatingSetpoint;
    if (heatingSetpoint >= coolingSetpoint - 1) {
      newHeatingSetpoint = coolingSetpoint - 2;
    }
    return newHeatingSetpoint
  },

  adjustedCoolingSetpoint(heatingSetpoint, coolingSetpoint) {
    let newCoolingSetpoint = coolingSetpoint;
    if (coolingSetpoint <= heatingSetpoint + 1) {
      newCoolingSetpoint = heatingSetpoint + 2;
    }
    return newCoolingSetpoint
  },

  supportedThermostatModes() {
    return ['off', 'heat', 'cool', 'auto']
  },

  supportedThermostatFanModes() {
    return ['auto', 'on']
  }
};