var createWindow, win;
createWindow = function(navGroup, windowStack, folder) {
  var $$, Folder, Site, doneBtn, editBtn, editDoneBtn, fs, isEditing, mix, newBtn, tableView, trace, updateTable, window, _closeAll, _tableViewHandler;
  if (folder == null) {
    folder = null;
  }
  Site = app.models.Site;
  Folder = app.models.Folder;
  mix = app.helpers.util.mix;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.bookmarks;
  isEditing = false;
  fs = Ti.UI.createButton($$.fs);
  editBtn = Ti.UI.createButton($$.editBtn);
  doneBtn = Ti.UI.createButton($$.doneBtn);
  editDoneBtn = Ti.UI.createButton($$.doneBtn);
  newBtn = Ti.UI.createButton($$.newBtn);
  window = Ti.UI.createWindow(mix($$.window, {
    title: folder != null ? folder.title : 'Bookmarks',
    toolbar: [editBtn, fs]
  }));
  tableView = Ti.UI.createTableView($$.tableView);
  window.setRightNavButton(doneBtn);
  window.add(tableView);
  updateTable = function() {
    var rows, site, sites, _i, _len;
    rows = [];
    if (folder === null) {
      rows.push(Ti.UI.createTableViewRow(mix($$.tableViewRow, {
        title: 'History',
        hasChild: true,
        leftImage: 'image/dark_folder.png'
      })));
      sites = Site.all();
    } else {
      sites = Site.all(folder.id);
    }
    for (_i = 0, _len = sites.length; _i < _len; _i++) {
      site = sites[_i];
      rows.push(Ti.UI.createTableViewRow(mix($$.tableViewRow, {
        id: site.id,
        title: site.title,
        url: site.url,
        hasChild: site.stype > 1 ? true : false,
        leftImage: site.stype > 1 ? 'image/dark_folder.png' : null
      })));
    }
    tableView.setData(rows);
  };
  _closeAll = function() {
    windowStack[0].close();
    while (windowStack.length > 1) {
      windowStack.pop().close();
    }
  };
  _tableViewHandler = function(e) {
    var childfolder, data;
    switch (e.type) {
      case 'click':
        if (isEditing) {
          if (typeof e.row.id === 'number') {
            data = Site.findById(e.row.id);
            app.views.bookmarksEdit.win.openChild(navGroup, windowStack, data);
          }
        } else {
          if (e.row.hasChild) {
            if (typeof e.row.id === 'number') {
              childfolder = Folder.findById(e.row.id);
              win.openChild(navGroup, windowStack, childfolder);
            } else {
              app.views.bookmarksHistories.win.open(navGroup, windowStack);
            }
          } else {
            Ti.App.fireEvent('root.openURL', {
              url: e.row.url
            });
            _closeAll();
          }
        }
        break;
      case 'delete':
        if (typeof e.row.id !== 'undefined') {
          if (e.row.hasChild) {
            data = Folder.findById(e.row.id);
          } else {
            data = Site.findById(e.row.id);
          }
          data.del();
        }
        break;
      case 'move':
        if (typeof e.row.id !== 'undefined') {
          data = Site.findById(e.row.id);
          if (folder === null) {
            data.move(e.index);
          } else {
            data.move(e.index + 1);
          }
        }
    }
  };
  tableView.addEventListener('click', _tableViewHandler);
  tableView.addEventListener('delete', _tableViewHandler);
  tableView.addEventListener('move', _tableViewHandler);
  doneBtn.addEventListener('click', function(e) {
    _closeAll();
  });
  editBtn.addEventListener('click', function(e) {
    isEditing = true;
    window.setRightNavButton(null);
    window.toolbar = [editDoneBtn, fs, newBtn];
    tableView.editing = true;
    tableView.moving = true;
  });
  editDoneBtn.addEventListener('click', function(e) {
    isEditing = false;
    window.setRightNavButton(doneBtn);
    window.toolbar = [editBtn, fs];
    tableView.editing = false;
    tableView.moving = false;
  });
  newBtn.addEventListener('click', function(e) {
    var newfolder;
    newfolder = new Folder('New Folder');
    app.views.bookmarksEdit.win.openChild(navGroup, windowStack, newfolder);
  });
  window.updateTable = updateTable;
  return window;
};
win = {
  open: function() {
    var navGroup, window, windowStack;
    windowStack = [
      Ti.UI.createWindow({
        navBarHidden: true
      })
    ];
    navGroup = Ti.UI.iPhone.createNavigationGroup();
    window = createWindow(navGroup, windowStack);
    windowStack.push(window);
    window.updateTable();
    navGroup.window = window;
    windowStack[0].add(navGroup);
    windowStack[0].open({
      modal: true
    });
  },
  openChild: function(navGroup, windowStack, folder) {
    var window;
    window = createWindow(navGroup, windowStack, folder);
    window.updateTable();
    windowStack.push(window);
    window.addEventListener('close', function(e) {
      windowStack.pop();
    });
    navGroup.open(window);
  }
};
exports.win = win;