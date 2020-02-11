let viewModel;

function capitalize(str) {
  return str.split().map(it => it.charAt(0).toUpperCase() + it.slice(1))
}

function toggleValue(externalAttribute, value) {
  if (externalAttribute === 'motion') {
    return value === 'active' ? 'inactive' : 'active'
  }
  else if (externalAttribute === 'contact') {
    return value === 'open' ? 'closed' : 'open'
  }
  else if (externalAttribute === 'switch') {
    return value === 'on' ? 'off' : 'on'
  }
  else if (externalAttribute === 'windowShade') {
    return value === 'open' ? 'closed' : 'open'
  }
  else if (externalAttribute === 'lock') {
    return value === 'locked' ? 'unlocked' : 'locked'
  }
  else if (externalAttribute === 'smoke') {
    return value === 'clear' ? 'detected' : 'clear'
  }
  else if (externalAttribute === 'carbonMonoxide') {
    return value === 'clear' ? 'detected' : 'clear'
  }
  else if (externalAttribute === 'water') {
    return value === 'dry' ? 'wet' : 'dry'
  }
  else {
    return value
  }
}

function mainAttribute(externalStates) {
  if (externalStates['switch']) {
    return 'switch'
  }
  else if (externalStates['contact']) {
    return 'contact'
  }
  else if (externalStates['motion']) {
    return 'motion'
  }
  else if (externalStates['temperature']) {
    return 'temperature'
  }
  else if (externalStates['windowShade']) {
    return 'windowShade'
  }
  else if (externalStates['power']) {
    return 'power'
  }
  else if (externalStates['button']) {
    return 'button'
  }
  else if (externalStates['lock']) {
    return 'lock'
  }
  else if (externalStates['smoke']) {
    return 'smoke'
  }
  else if (externalStates['water']) {
    return 'water'
  }
  else {
    return Object.keys(externalStates)[0]
  }
}

function controlMetadata(externalAttributeName) {
  const segs = externalAttributeName.split('_');
  const externalAttribute = segs[segs.length-1];
  if (externalAttribute === 'online') {
    return {type: 'bool'}
  }
  else if (externalAttribute === 'motion') {
    return {type: 'enum', values: ['inactive', 'active']}
  }
  else if (externalAttribute === 'contact') {
    return {type: 'enum', values: ['closed', 'open']}
  }
  else if (externalAttribute === 'valve') {
    return {type: 'enum', values: ['closed', 'open']}
  }
  else if (externalAttribute === 'lock') {
    return {type: 'enum', values: ['locked', 'unlocked', 'unlocked with timeout', 'unknown']}
  }
  else if (externalAttribute === 'windowShade') {
    return {type: 'enum', values: ['closed', 'open']}
  }
  else if (externalAttribute === 'supportedWindowShadeCommands') {
    return {type: 'multi', values: ['open', 'close', 'pause']}
  }
  else if (externalAttribute === 'switch') {
    return {type: 'enum', values: ['off', 'on']}
  }
  else if (externalAttribute === 'brightness') {
    return {type: 'slider', min: 0, max: 100}
  }
  else if (externalAttribute === 'colorTemperature') {
    return {type: 'slider', min: 2400, max: 6800}
  }
  else if (externalAttribute === 'hue') {
    return {type: 'slider', min: 0, max: 360}
  }
  else if (externalAttribute === 'saturation') {
    return {type: 'slider', min: 0, max: 100}
  }
  else if (externalAttribute === 'heatingSetpoint') {
    return {type: 'slider', min: 0, max: 100}
  }
  else if (externalAttribute === 'coolingSetpoint') {
    return {type: 'slider', min: 0, max: 100}
  }
  else if (externalAttribute === 'airConditionerMode') {
    return {type: 'enum', property: 'supportedAcModes', values: ['cool','fanOnly']}
  }
  else if (externalAttribute === 'supportedAcModes') {
    return {type: 'multi', values: ['cool', 'dry', 'fanOnly', 'heat', 'coolClean', 'dryClean', 'heatClean', 'auto']}
  }
  else if (externalAttribute === 'thermostatMode') {
    return {type: 'enum', property: 'supportedThermostatModes', values: ['off', 'heat', 'cool', 'auto']}
  }
  else if (externalAttribute === 'supportedThermostatModes') {
    return {type: 'multi', values: ['off', 'heat', 'cool', 'auto', 'emergency heat', 'eco']}
  }
  else if (externalAttribute === 'thermostatFanMode') {
    return {type: 'enum', property: 'supportedThermostatFanModes', values: ['on', 'auto']}
  }
  else if (externalAttribute === 'supportedThermostatFanModes') {
    return {type: 'multi', values: ['auto', 'on', 'circulate']}
  }
  else if (externalAttribute === 'thermostatOperatingState') {
    return {type: 'enum', values: ['idle', 'heating', 'cooling']}
  }
  else if (externalAttribute === 'temperature') {
    return {type: 'number'}
  }
  else if (externalAttribute === 'outputModulation') {
    return {type: 'enum', values: ['dc', '50hz', '60hz', '400Hz']}
  }
  else if (externalAttribute === 'outputVoltage') {
    return {type: 'slider', min: 0, max: 240}
  }
  else if (externalAttribute === 'gasMeterPrecision') {
    return {type: 'object'}
  }
  else if (externalAttribute === 'gasMeterTime') {
    return {type: 'field'}
  }
  else if (externalAttribute === 'button') {
    return {type: 'enum', property: 'supportedButtonValues', values: ['pushed', 'held', 'double']}
  }
  else if (externalAttribute === 'supportedButtonValues') {
    return {type: 'multi', values: [
        "pushed",
        "held",
        "double",
        "pushed_2x",
        "pushed_3x",
        "pushed_4x",
        "pushed_5x",
        "pushed_6x",
        "down",
        "down_2x",
        "down_3x",
        "down_4x",
        "down_5x",
        "down_6x",
        "down_hold",
        "up",
        "up_2x",
        "up_3x",
        "up_4x",
        "up_5x",
        "up_6x",
        "up_hold"
      ]}
  } else if (externalAttribute === 'smoke') {
    return {type: 'enum', values: ['clear', 'detected', 'tested']}
  } else if (externalAttribute === 'carbonMonoxide') {
    return {type: 'enum', values: ['clear', 'detected', 'tested']}
  } else if (externalAttribute === 'water') {
    return {type: 'enum', values: ['dry', 'wet']}
  } else if (externalAttribute === 'temperatureScale') {
    return {type: 'enum', values: ['F', 'C']}
  } else {
    return {type: 'number'}
  }
}

function showDetailDialog(device) {
  viewModel.selectDevice(device.externalId);
  $( "#deviceDetailDialog" ).dialog({width: 400, modal: true});
}

function showAddDeviceDialog() {
  $( "#addDeviceDialog" ).dialog({width: 400, modal: true});
}

function closeAddDeviceDialog() {
  $( "#addDeviceDialog" ).dialog('close');
}

function showDeleteDeviceDialog() {
  $( "#deleteDevicesDialog" ).dialog({width: 400, modal: true});
}

function closeDeleteDeviceDialog() {
  $( "#deleteDevicesDialog" ).dialog('close');
}

$( document ).ready(function() {

  $.get('/devices/viewData', function(viewData) {

    viewModel = new ViewModel(viewData);

    ko.applyBindings(viewModel);

    const eventSource = new EventSource('/devices/stream');
    eventSource.onmessage = function(e) {
      for (const device of JSON.parse(e.data)) {
        const item = viewModel.devices().find(function(it) {
          return it.externalId === device.externalDeviceId
        });
        if (item) {
          const state = device.states.find(it => { return it.attribute === item.mainAttribute });
          item.updateStates(device.states)
        }
      }
    };

    eventSource.onerror = function(e) {
      console.log('EventSource failed %j', e);
    };
  });

  $("input[name='done']").click(function(evt) {
    $(this).addClass('processing')
  });
});
