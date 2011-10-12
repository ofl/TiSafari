var createWindow, win;
createWindow = function(navGroup, data) {
  var $$, Folder, doneBtn, mix, tableView, trace, window;
  Folder = app.models.Folder;
  mix = app.helpers.util.mix;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.bookmarksEditFolders;
  window = Ti.UI.createWindow(mix($$.window, {
    title: 'Bookmark'
  }));
  tableView = Ti.UI.createTableView($$.tableView);
  window.add(tableView);
  doneBtn = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE
  });
  window.setRightNavButton(doneBtn);
  (function() {
    var folder, folders, rows, _i, _len;
    rows = [
      Ti.UI.createTableViewRow(mix($$.tableViewRow, {
        title: 'Bookmark',
        hasCheck: data.parentid === -1 ? true : false,
        id: -1
      }))
    ];
    folders = Folder.tree(data);
    for (_i = 0, _len = folders.length; _i < _len; _i++) {
      folder = folders[_i];
      rows.push(Ti.UI.createTableViewRow(mix($$.tableViewRow, {
        title: folder.title,
        id: folder.id,
        hasCheck: data.parentid === folder.id ? true : false,
        indentionLevel: folder.indent
      })));
    }
    tableView.setData(rows);
  })();
  doneBtn.addEventListener('click', function(e) {
    navGroup.close(window);
    window = null;
  });
  tableView.addEventListener('click', function(e) {
    if (data.parentid !== e.row.id) {
      data.parentid = e.row.id;
      data.position = -1;
      data.save();
      Ti.App.fireEvent('bookmarksEdit.updateFolderRow');
    }
    navGroup.close(window);
  });
  return window;
};
win = {
  open: function(navGroup, data) {
    var window;
    window = createWindow(navGroup, data);
    navGroup.open(window);
  }
};
exports.win = win;