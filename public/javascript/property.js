const Property = function(parent, externalId, propertyName, propertyValue) {
  var self = this;
  this.parent = parent;
  this.externalId = externalId;
  this.propertyName = propertyName;
  this.controlMetadata = controlMetadata(propertyName);
  this.internalValue = ko.observable(propertyValue);

  this.propertyValue = ko.pureComputed({
    read: function() {
      return self.internalValue()
    },
    write: function(value) {
      self.internalValue(value)
      self.sendCommand(value)
    }
  });

  this.displayName = ko.pureComputed(function() {
    return capitalize(self.propertyName)
  });

  this.jsonValue = ko.computed(function() {
    return JSON.stringify(self.propertyValue(), null, 2)
  });

  this.typedValue = ko.pureComputed(function() {
    return this.convertValue(this.propertyValue())
  }, this);

  this.isEnumControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'enum'
  }, this);

  this.enumValues = ko.pureComputed(function() {
    if (this.controlMetadata.property && this.parent.stateMap[this.controlMetadata.property]) {
      return this.parent.stateMap[this.controlMetadata.property].propertyValue()
    }
    return this.controlMetadata.values
  }, this);

  this.isMultiControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'multi'
  }, this);

  this.multiValues = ko.pureComputed(function() {
    return this.controlMetadata.values
  }, this);

  this.isSliderControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'slider'
  }, this);

  this.sliderMin = ko.pureComputed(function() {
    return this.controlMetadata.min
  }, this);

  this.sliderMax = ko.pureComputed(function() {
    return this.controlMetadata.max
  }, this);

  this.isFieldControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'field'
  }, this);

  this.isNumberControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'number'
  }, this);

  this.isObjectControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'object'
  }, this);

  this.isBooleanControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'bool'
  }, this);

  this.convertValue = function(value) {
    switch(this.controlMetadata.type) {
      case 'slider':
      case 'number':
        return Number(value);
      case 'object':
        return JSON.parse(value);
    }
    return value;
  };

  this.sendCommand = function(newValue) {
    const externalId = this.externalId;
    const propertyName = this.propertyName;
    const propertyValue = this.convertValue(newValue);
    $('#general-spinner').show();
    $.ajax({
      type: "POST",
      url: '/devices/command',
      data: JSON.stringify({
        username: parent.parent.username,
        externalId: externalId,
        states: {[propertyName]: propertyValue}
      }),
      success: function (data) {
        $('#general-spinner').hide();
      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8"
    });
  };
};
