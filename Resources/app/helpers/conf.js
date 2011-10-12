var exports;
(function() {
  if (!Ti.App.Properties.hasProperty('lastPage')) {
    return Ti.App.Properties.setString('lastPage', 'http://www.google.co.jp');
  }
})();
exports = {};