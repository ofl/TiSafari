var app;
app = {};
(function() {
  app.helpers = {};
  app.helpers.conf = require('app/helpers/conf');
  app.helpers.util = require('app/helpers/util');
  app.helpers.style = require('app/helpers/style');
  app.models = require('app/models/Site');
  app.views = {};
  app.views.root = require('app/views/win');
  app.views.bookmarks = require('app/views/bookmarks/win');
  app.views.bookmarksEdit = require('app/views/bookmarks/edit/win');
  app.views.bookmarksEditFolders = require('app/views/bookmarks/edit/folders/win');
  app.views.bookmarksHistories = require('app/views/bookmarks/histories/win');
  app.views.root.win.open();
})();