"use strict";

Array.prototype.getBy = function(key, val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) {
      return this[i];
    }
  }
  return null;
};

Array.prototype.getWhere = function(key, val) {
  var results = [];
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) {
      results.push(this[i]);
    }
  }
  return results;
};

Array.prototype.removeAt = function(index) {
  return this.splice(index, 1);
};

Array.prototype.removeBy = function(key, val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) {
      return this.removeAt(i);
    }
  }
  return false;
};

Array.prototype.removeWhere = function(key, val) {
  var removed = 0;
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val) {
      this.removeAt(i--);
      removed++;
    }
  }
  return removed;
};

Array.prototype.updateWhere = function(findKey, findVal, key, val) {
  var updated = 0;
  for (var i = 0; i < this.length; i++) {
    if (this[i][findKey] === findVal) {
      this[i][key] = val;
    }
  }
  return updated;
};

Array.prototype.countWhere = function(key, val) {
  var count = 0;
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === val)
      count++;
  }
  return count;
};

Array.prototype.sum = function() {
  var sum = 0;
  for (var i = 0; i < this.length; i++) {
    sum += this[i];
  }
  return sum;
};

Object.defineProperties(Array.prototype, {
  'first': {
    set: function(val) { this[0] = val; },
    get: function() { return this[0]; }
  },
  'last': {
    set: function(val) { this[this.length - 1] = val; },
    get: function() { return this[this.length - 1]; }
  },
  'count': {
    set: function(val) { this.length = val; },
    get: function() { return this.length; }
  }
});