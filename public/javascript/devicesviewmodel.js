const ViewModel = function (viewData) {
  this.username = viewData.username;

  this.deviceTypes = viewData.deviceTypes;

  this.devices = ko.observableArray();

  this.hasDevices = ko.pureComputed(function() {
    return this.devices && this.devices().length > 0
  }, this);

  this.selectedDevice = ko.observable();

  this.selectDevice = function(externalId) {
    const device = this.devices().find(it => { return it.externalId === externalId});
    if (device) {
      this.selectedDevice(device);
    }
    else {
      this.selectedDevice(null);
    }
  };

  this.createDevice = function(formElement) {
    const button = $("input[name='create']");
    const model = this;
    const data = {
      deviceType: $('#deviceType').val(),
      displayName: $('#displayName').val()
    };

    button.addClass('processing');
    $.ajax({
      method: 'POST',
      url: '/devices/create',
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function (device) {
        model.devices.push(new Device(model, device));
        $('#addDeviceDialog').dialog('close');
        button.removeClass('processing');
      }
    });
  };

  this.deleteDevice = function(formElement) {
    const button = $("input[name='delete']");
    const model = this;
    const deviceIds = [];

    button.addClass('processing');
    $("input[name='deviceIds']:checked").each((index, elem) => {
      deviceIds.push($(elem).val());
    });
    $.ajax({
      method: 'POST',
      url: '/devices/delete',
      data: JSON.stringify({deviceIds: deviceIds}),
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function(data) {
        model.devices.remove( function (item) { return data.items.includes(item.externalId); } );
        $('#deleteDevicesDialog').dialog('close');
        button.removeClass('processing');
      }
    });
  };

  this.showDetailDialog = function(device) {
    this.selectDevice(device.externalId);
    $( "#deviceDetailDialog" ).dialog({width: 400, modal: true});
  };

  const list = viewData.devices.sort( (a, b) => {
    return a.displayName === b.displayName ? 0 : (a.displayName > b.displayName) ? 1 : -1
  });
  for (const device of list) {
    this.devices.push(new Device(this, device))
  }
};
