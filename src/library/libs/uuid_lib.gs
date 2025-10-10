var CrmLib = CrmLib || {};

CrmLib.generateUuidV4 = function() {
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

CrmLib.generateTimestampIsoUtc = function() {
  return new Date().toISOString();
}; 