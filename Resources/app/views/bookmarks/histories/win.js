var createWindow, win;
createWindow = function(navGroup, windowStack, date) {
  var $$, History, delBtn, doneBtn, fs, isEditing, mix, prettyDate, tableView, trace, window, _closeAll;
  History = app.models.History;
  mix = app.helpers.util.mix;
  prettyDate = app.helpers.util.prettyDate;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.bookmarks;
  isEditing = false;
  fs = Ti.UI.createButton($$.fs);
  delBtn = Ti.UI.createButton($$.delBtn);
  doneBtn = Ti.UI.createButton($$.doneBtn);
  tableView = Ti.UI.createTableView($$.tableView);
  window = Ti.UI.createWindow(mix($$.window, {
    toolbar: [delBtn, fs],
    title: date != null ? prettyDate(date) : 'Histories'
  }));
  window.setRightNavButton(doneBtn);
  window.add(tableView);
  (function(date) {
    var d, folder, folders, histories, history, i, row, rows, today, _i, _j, _len, _len2, _len3;
    rows = [];
    if (date != null) {
      histories = History.findAllByDate(date);
      for (_i = 0, _len = histories.length; _i < _len; _i++) {
        history = histories[_i];
        row = Ti.UI.createTableViewRow(mix($$.tableViewRow, {
          id: history.id,
          title: history.title,
          url: history.url,
          hasChild: false
        }));
        rows.push(row);
      }
    } else {
      d = new Date();
      today = (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime();
      trace(today);
      histories = History.findAllByDate(today);
      for (i = 0, _len2 = histories.length; i < _len2; i++) {
        history = histories[i];
        trace('ahooo');
        rows.push(Ti.UI.createTableViewRow(mix($$.tableViewRow, {
          id: history.id,
          title: history.title,
          url: history.url,
          hasChild: false
        })));
        if (i > 5) {
          rows.push(Ti.UI.createTableViewRow(mix($$.tableViewRow, {
            title: prettyDate(today),
            lastvisit: today
          })));
          break;
        }
      }
      folders = History.findDateOfWeek(today).reverse();
      for (_j = 0, _len3 = folders.length; _j < _len3; _j++) {
        folder = folders[_j];
        rows.push(Ti.UI.createTableViewRow(mix($$.tableViewRow, {
          title: prettyDate(folder.lastvisit),
          lastvisit: folder.lastvisit
        })));
      }
    }
    tableView.setData(rows);
  })(date);
  _closeAll = function() {
    windowStack[0].close();
    while (windowStack.length > 1) {
      windowStack.pop().close();
    }
  };
  tableView.addEventListener('click', function(e) {
    if (e.row.hasChild) {
      win.open(navGroup, windowStack, e.row.lastvisit);
    } else {
      Ti.App.fireEvent('root.openURL', {
        url: e.row.url
      });
      _closeAll();
    }
  });
  delBtn.addEventListener('click', function(e) {
    History.delAll();
    navGroup.close(window);
  });
  doneBtn.addEventListener('click', function(e) {
    _closeAll();
  });
  return window;
};
win = {
  open: function(navGroup, windowStack, date) {
    var window;
    window = createWindow(navGroup, windowStack, date);
    windowStack.push(window);
    window.addEventListener('close', function(e) {
      windowStack.pop();
    });
    navGroup.open(window);
  }
};
exports.win = win;