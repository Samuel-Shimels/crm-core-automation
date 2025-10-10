var CrmLib = CrmLib || {};

CrmLib.requireFields = function(object, fields) {
  var missing = [];
  fields.forEach(function(f) { if (object[f] === undefined || object[f] === null || object[f] === '') missing.push(f); });
  if (missing.length > 0) throw new Error('Missing required fields: ' + missing.join(', '));
};

CrmLib.sanitizeString = function(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

CrmLib.toNumber = function(value) {
  var n = Number(value);
  if (isNaN(n)) return 0;
  return n;
}; 