exports.createTitleControlAndTable = function() {
  var $$, History, cancelBtn, focused, mix, modalView, reloadBtn, searchField, stopBtn, tableView, titleControl, trace, urlField, _closeTable, _searchFieldHandler, _tableViewHandler, _updateSearchRows, _updateSuggestRows, _urlFieldHandler;
  History = app.models.History;
  mix = app.helpers.util.mix;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.rootTableView;
  focused = 'url';
  titleControl = Ti.UI.createView($$.titleControl);
  stopBtn = Ti.UI.createButton($$.stopBtn);
  reloadBtn = Ti.UI.createButton($$.reloadBtn);
  urlField = Ti.UI.createTextField(mix($$.urlField, {
    rightButton: reloadBtn
  }));
  searchField = Ti.UI.createTextField($$.searchField);
  cancelBtn = Ti.UI.createButton($$.cancelBtn);
  titleControl.add(searchField);
  titleControl.add(urlField);
  titleControl.add(cancelBtn);
  modalView = Ti.UI.createView($$.modalView);
  tableView = Ti.UI.createTableView($$.tableView);
  modalView.add(tableView);
  _updateSearchRows = function(text) {
    var url, xhr;
    if (Titanium.Network.online !== false) {
      xhr = Titanium.Network.createHTTPClient();
      url = 'http://suggestqueries.google.com/complete/search?hl=ja&json=t&qu=' + text;
      xhr.open('GET', url);
      xhr.onload = function(e) {
        var data, item, json, rows, _i, _len;
        json = eval('(' + this.responseText + ')');
        if (json != null) {
          data = json[1];
          rows = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            rows.push(Ti.UI.createTableViewRow(mix($$.searchRow, {
              title: item
            })));
          }
          tableView.setData(rows);
          if (data.length > 0) {
            tableView.visible = true;
          }
        }
      };
      xhr.onerror = function(error) {
        alert(error);
      };
      xhr.send();
    } else {
      alert('Network disconnected.');
    }
  };
  _updateSuggestRows = function(text) {
    var histories, item, row, rows, _i, _len;
    histories = History.findAllByTitle(text);
    if (histories.length > 0) {
      rows = [];
      for (_i = 0, _len = histories.length; _i < _len; _i++) {
        item = histories[_i];
        row = Ti.UI.createTableViewRow(mix($$.suggestRow, {
          url: item.url
        }));
        row.add(Ti.UI.createLabel(mix($$.suggestRowTitle, {
          text: item.title
        })));
        row.add(Ti.UI.createLabel(mix($$.suggestRowURL, {
          text: item.url
        })));
        rows.push(row);
      }
      tableView.setData(rows);
      tableView.visible = true;
    }
  };
  _closeTable = function(e) {
    searchField.blur();
    urlField.blur();
    tableView.visible = false;
    modalView.animate({
      opacity: $$.modalView.opacity
    }, function() {
      Ti.App.fireEvent('root.removeTable');
    });
    if (focused === 'url') {
      searchField.show();
      urlField.animate({
        width: 210
      });
      cancelBtn.animate({
        right: -75
      });
    } else {
      searchField.animate({
        width: 95,
        right: 0
      });
      urlField.animate({
        left: 0
      });
      cancelBtn.animate({
        right: -75
      });
    }
  };
  _urlFieldHandler = function(e) {
    switch (e.type) {
      case 'focus':
        focused = 'url';
        Ti.App.fireEvent('root.addTable');
        setTimeout(function() {
          modalView.animate({
            opacity: 0.8
          });
          searchField.hide();
          urlField.animate({
            width: 240
          });
          return cancelBtn.animate({
            right: 0
          });
        }, 100);
        break;
      case 'return':
        Ti.App.fireEvent('root.openURL', {
          url: urlField.value
        });
        _closeTable();
        break;
      case 'change':
        if (urlField.value.length > 0) {
          _updateSuggestRows(urlField.value);
        }
    }
  };
  _searchFieldHandler = function(e) {
    switch (e.type) {
      case 'focus':
        focused = 'search';
        Ti.App.fireEvent('root.addTable');
        setTimeout(function() {
          modalView.animate({
            opacity: 0.8
          });
          searchField.animate({
            width: 230,
            right: 75
          });
          urlField.animate({
            left: -220
          });
          return cancelBtn.animate({
            right: 0
          });
        }, 100);
        break;
      case 'change':
        if (searchField.value.length > 0) {
          _updateSearchRows(searchField.value);
        }
    }
  };
  _tableViewHandler = function(e) {
    var url;
    switch (e.type) {
      case 'scroll':
        searchField.blur();
        urlField.blur();
        break;
      case 'click':
        if (focused === 'url') {
          url = e.row.url;
        } else {
          url = 'http://www.google.co.jp/search?hl=ja&site=&q=' + e.row.title;
        }
        Ti.App.fireEvent('root.openURL', {
          url: url
        });
        _closeTable();
    }
  };
  urlField.addEventListener('focus', _urlFieldHandler);
  urlField.addEventListener('blur', _urlFieldHandler);
  urlField.addEventListener('return', _urlFieldHandler);
  urlField.addEventListener('change', _urlFieldHandler);
  searchField.addEventListener('focus', _searchFieldHandler);
  searchField.addEventListener('blur', _searchFieldHandler);
  searchField.addEventListener('return', _searchFieldHandler);
  searchField.addEventListener('change', _searchFieldHandler);
  tableView.addEventListener('scroll', _tableViewHandler);
  tableView.addEventListener('click', _tableViewHandler);
  cancelBtn.addEventListener('click', _closeTable);
  reloadBtn.addEventListener('click', function(e) {
    Ti.App.fireEvent('root.reload');
  });
  stopBtn.addEventListener('click', function(e) {
    Ti.App.fireEvent('root.stopLoading');
  });
  Ti.App.addEventListener('root.tableView.updateUrlField', function(e) {
    urlField.value = e.uri;
    searchField.value = '';
  });
  return {
    titleControl: titleControl,
    tableView: modalView
  };
};