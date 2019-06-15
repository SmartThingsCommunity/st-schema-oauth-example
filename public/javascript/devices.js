function capitalize(str) {
  return str.split().map(it => it.charAt(0).toUpperCase() + it.slice(1))
}

function toggleValue(attribute, value) {
  if (attribute === 'motion') {
    return value === 'active' ? 'inactive' : 'active'
  }
  else if (attribute === 'contact') {
    return value === 'open' ? 'closed' : 'open'
  }
  else {
    return value === 'on' ? 'off' : 'on'
  }
}

function mainAttribute(states) {
  if (states['switch']) {
    return 'switch'
  }
  else if (states['contact']) {
    return 'contact'
  }
  else if (states['motion']) {
    return 'motion'
  }
  else if (states['temperature']) {
    return 'temperature'
  }
  else {
    return Object.keys(states)[0]
  }
}

function controlMetadata(attribute) {
  if (attribute === 'motion') {
    return {type: 'enum', values: ['inactive', 'active']}
  }
  else if (attribute === 'contact') {
    return {type: 'enum', values: ['closed', 'open']}
  }
  else if (attribute === 'switch') {
    return {type: 'enum', values: ['off', 'on']}
  }
  else if (attribute === 'brightness') {
    return {type: 'slider', min: 0, max: 100}
  }
  else if (attribute === 'colorTemperature') {
    return {type: 'slider', min: 2400, max: 6800}
  }
  else if (attribute === 'hue') {
    return {type: 'slider', min: 0, max: 360}
  }
  else if (attribute === 'saturation') {
    return {type: 'slider', min: 0, max: 100}
  }
  else if (attribute === 'heatingSetpoint') {
    return {type: 'slider', min: 50, max: 90}
  }
  else if (attribute === 'coolingSetpoint') {
    return {type: 'slider', min: 50, max: 90}
  }
  else if (attribute === 'thermostatMode') {
    return {type: 'enum', values: ['off', 'heat', 'cool', 'auto']}
  }
  else if (attribute === 'thermostatFanMode') {
    return {type: 'enum', values: ['auto', 'on']}
  }
  else if (attribute === 'thermostatOperatingState') {
    return {type: 'enum', values: ['idle', 'heating', 'cooling']}
  }
  else if (attribute === 'temperature') {
    return {type: 'number'}
  }
  else {
    return {type: 'number'}
  }
}

$( document ).ready(function() {

  $('#addDeviceButton, #addDeviceLink').click(function() {
    $( "#addDeviceDialog" ).dialog({width: 400, modal: true});
    return false;
  });

  $('#cancelAddDeviceDialog').click(function() {
    $( "#addDeviceDialog" ).dialog('close');
    return false;
  });

  $('#deleteDevicesButton').click(function() {
    $( "#deleteDevicesDialog" ).dialog({width: 400, modal: true});
    return false;
  });

  $('#cancelDeleteDevicesDialog').click(function() {
    $( "#deleteDevicesDialog" ).dialog('close');
    return false;
  });

  $.get('/devices/viewData', function(viewData) {

    const viewModel = new ViewModel(viewData);

    ko.applyBindings(viewModel);

    const eventSource = new EventSource('/devices/stream')
    eventSource.onmessage = function(e) {
      console.log(`onmessage: ${e.data}`);
      for (const device of JSON.parse(e.data)) {
        const item = viewModel.devices.find(function(it) {
          return it.externalId === device.externalDeviceId
        });
        // TODO - handle all attributes
        if (item) {
          const mainState = device.states.find(function(it) {
            return it.component === 'main' && it.attribute === 'switch'
          });
          if (mainState) {
            item.mainState(mainState.value)
          }
        }
      }
    };

    $('.displayName').click(function() {
      console.log('click');
      const elem = $(this);
      const externalId = elem.attr('id');
      console.log('selected ' + externalId);
      viewModel.selectDevice(externalId);
      $( "#deviceDetailDialog" ).dialog({width: 400, modal: true});
      return false;
    })

    eventSource.onerror = function(e) {
      console.log('EventSource failed %j', e);
    };
  })
})