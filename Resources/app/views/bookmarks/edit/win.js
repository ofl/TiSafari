var createWindow, win;
createWindow = function(navGroup, windowStack, data) {
  var $$, Site, cancelBtn, folderRow, mix, saveBtn, tableView, titleField, titleRow, trace, updateFolderRow, urlField, urlRow, window, _closeWindow, _textFieldHandler, _updateData;
  Site = app.models.Site;
  mix = app.helpers.util.mix;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.bookmarksEdit;
  window = Ti.UI.createWindow(mix($$.window, {
    title: data.stype === 1 ? 'Edit Bookmark' : 'Edit Folder'
  }));
  titleRow = Ti.UI.createTableViewRow($$.tableViewRow);
  titleField = Ti.UI.createTextField(mix($$.titleField, {
    value: data.title
  }));
  titleRow.add(titleField);
  if (data.stype === 1) {
    urlRow = Ti.UI.createTableViewRow($$.tableViewRow);
    urlField = Ti.UI.createTextField(mix($$.urlField, {
      value: data.url
    }));
    urlRow.add(urlField);
  }
  folderRow = Ti.UI.createTableViewRow(mix($$.tableViewRow, {
    header: '',
    hasChild: true
  }));
  tableView = Ti.UI.createTableView(mix($$.tableView, {
    data: data.stype === 1 ? [titleRow, urlRow, folderRow] : [titleRow, folderRow]
  }));
  window.add(tableView);
  if (data.stype === 1 && (data.id === null || typeof data.id === 'undefined')) {
    urlField.editable = false;
    saveBtn = Ti.UI.createButton($$.saveBtn);
    cancelBtn = Ti.UI.createButton($$.cancelBtn);
    window.setRightNavButton(saveBtn);
    window.setLeftNavButton(cancelBtn);
    _closeWindow = function() {
      windowStack[0].close();
    };
  } else {
    _closeWindow = function() {
      navGroup.close(window);
    };
  }
  updateFolderRow = function() {
    var folder;
    if (data.parentid !== -1) {
      folder = Site.findById(data.parentid);
      folderRow.title = folder.title;
    } else {
      folderRow.title = 'Bookmark';
    }
  };
  updateFolderRow();
  _updateData = function() {
    var window, _i, _len;
    data.title = titleField.value;
    if (data.stype === 1) {
      data.url = urlField.value;
    }
    data.save();
    for (_i = 0, _len = windowStack.length; _i < _len; _i++) {
      window = windowStack[_i];
      trace('done?' + windowStack.length + typeof window.updateTable);
      if (typeof window.updateTable === 'function') {
        trace('doneEDit');
        window.updateTable();
      }
    }
  };
  _textFieldHandler = function(e) {
    _updateData();
    _closeWindow();
  };
  titleField.addEventListener('return', _textFieldHandler);
  folderRow.addEventListener('click', function() {
    app.views.bookmarksEditFolders.win.open(navGroup, data);
  });
  if (data.stype === 1 && (data.id === null || typeof data.id === 'undefined')) {
    saveBtn.addEventListener('click', function(e) {
      _updateData();
      _closeWindow();
    });
    cancelBtn.addEventListener('click', function(e) {
      if (typeof data.id === 'number') {
        data.del();
      }
      _closeWindow();
    });
    urlField.addEventListener('return', _textFieldHandler);
  }
  window.addEventListener('open', function() {
    setTimeout(titleField.focus, 300);
  });
  window.addEventListener('close', function() {
    Ti.App.removeEventListener('bookmarksEdit.updateFolderRow', updateFolderRow);
  });
  Ti.App.addEventListener('bookmarksEdit.updateFolderRow', updateFolderRow);
  return window;
};
win = {
  open: function(data) {
    var navGroup, window, windowStack;
    windowStack = [
      Ti.UI.createWindow({
        navBarHidden: true
      })
    ];
    navGroup = Ti.UI.iPhone.createNavigationGroup();
    windowStack[0].add(navGroup);
    window = createWindow(navGroup, windowStack, data);
    navGroup.window = window;
    windowStack[0].open({
      modal: true
    });
  },
  openChild: function(navGroup, windowStack, data) {
    var window;
    window = createWindow(navGroup, windowStack, data);
    navGroup.open(window);
  }
};
exports.win = win;