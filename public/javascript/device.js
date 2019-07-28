const Device = function (parent, device) {
  const states = device.states;
  this.parent = parent;
  this.externalId = device.externalId;
  this.displayName = device.displayName;
  this.mainAttribute = mainAttribute(states);
  this.mainState = ko.observable(states[mainAttribute(states)]);

  this.allStates = Object.keys(states)
    .sort( (a, b) => {
      return a === b ? 0 : (a > b) ? 1 : -1
    })
    .map(key => {
      return new Property(this, this.externalId, key, states[key])
    });

  this.stateMap = this.allStates.reduce(function(map, obj) {
    map[obj.propertyName] = obj;
    return map;
  }, {});

  this.displayStates = ko.pureComputed(function() {
    return this.allStates.filter(it => { return it.propertyName !== 'online'})
  }, this);

  this.tileActive = ko.observable(false);
  this.tileState = ko.pureComputed(function() {
    return `${this.tileActive() ? 'processing ' : ''}${this.mainState()}`;
  }, this);

  this.toggleState = function () {
    const mainState = this.mainState;
    const mainAttribute = this.mainAttribute;
    const tileActive = this.tileActive;
    const value = mainState();
    const newValue = toggleValue(this.mainAttribute, value);
    if (value !== newValue) {
      tileActive(true);

      const params = {
        username: parent.username,
        externalId: this.externalId,
        states: {[mainAttribute]: newValue}
      };

      $.ajax({
        type: "POST",
        url: '/devices/command',
        data: JSON.stringify(params),
        success: function (data) {
          mainState(newValue);
          tileActive(false)
        },
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
      });
    }
  }
};
