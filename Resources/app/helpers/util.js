var exports;
exports = {
  trace: function(message) {
    Ti.API.info(message);
    Ti.API.info("Available memory: " + Ti.Platform.availableMemory);
  },
  mix: function() {
    var arg, child, prop, _i, _len;
    child = {};
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      for (prop in arg) {
        if (arg.hasOwnProperty(prop)) {
          child[prop] = arg[prop];
        }
      }
    }
    return child;
  },
  prettyDate: function(date) {
    var d, day, dayOfWeek, month, week, year;
    week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    d = new Date();
    d.setTime(date);
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
    dayOfWeek = week[d.getDay()];
    return "" + year + "/" + month + "/" + day + " (" + dayOfWeek + ")";
  }
};