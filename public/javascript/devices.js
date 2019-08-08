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
  else {
    return Object.keys(externalStates)[0]
  }
}

function controlMetadata(externalAttribute) {
  if (externalAttribute === 'motion') {
    return {type: 'enum', values: ['inactive', 'active']}
  }
  else if (externalAttribute === 'contact') {
    return {type: 'enum', values: ['closed', 'open']}
  }
  else if (externalAttribute === 'valve') {
    return {type: 'enum', values: ['closed', 'open']}
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
    return {type: 'slider', min: 50, max: 90}
  }
  else if (externalAttribute === 'coolingSetpoint') {
    return {type: 'slider', min: 50, max: 90}
  }
  else if (externalAttribute === 'thermostatMode') {
    return {type: 'enum', property: 'supportedThermostatModes', values: ['off', 'heat', 'cool', 'auto']}
  }
  else if (externalAttribute === 'supportedThermostatModes') {
    return {type: 'multi', values: ['off', 'heat', 'cool', 'auto', 'emergency heat', 'eco']}
  }
  else if (externalAttribute === 'thermostatFanMode') {
    return {type: 'enum', values: ['auto', 'on']}
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
  else {
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
          if (state) {
            item.mainState(state.value)
          }
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
