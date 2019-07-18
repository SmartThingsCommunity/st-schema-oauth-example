const Property = function(parent, externalId, propertyName, propertyValue) {
  this.parent = parent;
  this.externalId = externalId;
  this.propertyName = propertyName;
  this.controlMetadata = controlMetadata(propertyName)
  this.propertyValue = ko.observable(propertyValue);

  this.displayName = ko.pureComputed(function() {
    return capitalize(this.propertyName)
  }, this);

  this.isEnumControl = ko.pureComputed(function() {
    return this.controlMetadata.type === 'enum'
  }, this);

  this.enumValues = ko.pureComputed(function() {
    if (this.controlMetadata.property && this.parent.stateMap[this.controlMetadata.property]) {
      return this.parent.stateMap[this.controlMetadata.property].propertyValue()
    }
    return this.controlMetadata.values //.map(it => { return {value: it, label: capitalize(it)} })
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

  this.propertyValue.subscribe(function(newValue) {
    const externalId = this.externalId;
    const propertyName = this.propertyName;
    $.ajax({
      type: "POST",
      url: '/devices/command',
      data: JSON.stringify({
        username: parent.parent.username,
        externalId: externalId,
        states: {[propertyName]: newValue}
      }),
      success: function (data) {

      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8"
    });
  }, this);
};
