const ViewModel = function (viewData) {
  this.username = viewData.username;
  this.devices = viewData.devices.sort( (a, b) => {
    return a.displayName === b.displayName ? 0 : (a.displayName > b.displayName) ? 1 : -1
  })
    .map(device => {
      return new Device(this, device)
    });

  this.selectedDevice = ko.observable();

  this.selectDevice = function(externalId) {
    const device = this.devices.find(it => { return it.externalId === externalId});
    if (device) {
      this.selectedDevice(device);
    }
    else {
      this.selectedDevice(null);
    }
  }
}