var exports;
exports = (function() {
  var $$, History, Site, actBtn, backBtn, bookmarkBtn, fs, fwdBtn, idx, mix, pageBtn, pv, tabGroup, trace, tv, win, window, wl, _addWebView, _openURL, _refreshWindow, _webViewHandler;
  Site = app.models.Site;
  History = app.models.History;
  mix = app.helpers.util.mix;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.root;
  wl = [];
  idx = 0;
  fs = Ti.UI.createButton($$.fs);
  backBtn = Ti.UI.createButton($$.backBtn);
  fwdBtn = Ti.UI.createButton($$.fwdBtn);
  bookmarkBtn = Ti.UI.createButton($$.bookmarkBtn);
  pageBtn = Ti.UI.createButton($$.pageBtn);
  actBtn = Ti.UI.createButton($$.actBtn);
  tv = require('app/views/tableView').createTitleControlAndTable();
  pv = require('app/views/pageView').createPageViewAndToolBar();
  window = Ti.UI.createWindow(mix($$.window, {
    titleControl: tv.titleControl,
    toolbar: [backBtn, fs, fwdBtn, fs, actBtn, fs, bookmarkBtn, fs, pageBtn]
  }));
  tabGroup = Ti.UI.createTabGroup();
  tabGroup.addTab(Ti.UI.createTab({
    window: window
  }));
  _openURL = function(url) {
    var script;
    if (url.match(/^https?:\/\/.+$/)) {
      wl[idx].webView.url = url;
    } else if (url.match(/^javascript:.+$/)) {
      script = decodeURI(url.substring(11));
      if (script && script !== '') {
        try {
          wl[idx].webView.evalJS(script);
        } catch (error) {
          Ti.UI.createAlertDialog({
            title: 'Script Error',
            message: error.message
          });
        }
      }
    } else if (url.match(/^[a-zA-Z0-9]*:.+$/)) {
      Ti.Platform.openURL(url);
    }
  };
  _refreshWindow = function(page) {
    Ti.App.Properties.setString('lastPage', page.url);
    Ti.App.fireEvent('root.tableView.updateUrlField', {
      uri: page.url
    });
    window.titlePrompt = page.title;
    fwdBtn.enabled = page.webView.canGoForward() ? true : false;
    backBtn.enabled = page.webView.canGoBack() ? true : false;
    actBtn.enabled = true;
  };
  _webViewHandler = function(e) {
    var page, wv;
    wv = e.source;
    page = wl[idx];
    switch (e.type) {
      case 'beforeload':
        page.url = wv.evalJS('document.URL');
        page.title = wv.evalJS('document.title');
        break;
      case 'load':
        page.url = wv.evalJS('document.URL');
        page.title = wv.evalJS('document.title');
        History.create(page.title, page.url);
        _refreshWindow(page);
    }
  };
  _addWebView = function() {
    var webView;
    webView = Ti.UI.createWebView({
      zIndex: 10
    });
    webView.addEventListener('beforeload', _webViewHandler);
    webView.addEventListener('load', _webViewHandler);
    wl.push({
      webView: webView,
      title: 'No Name',
      url: ''
    });
  };
  backBtn.addEventListener('click', function(e) {
    wl[idx].webView.goBack();
  });
  fwdBtn.addEventListener('click', function(e) {
    wl[idx].webView.goForward();
  });
  bookmarkBtn.addEventListener('click', function(e) {
    app.views.bookmarks.win.open();
  });
  actBtn.addEventListener('click', function(e) {
    var di;
    di = Ti.UI.createOptionDialog($$.optionDialog);
    di.addEventListener('click', function(e) {
      var site;
      if (e.index === 0) {
        site = new Site(wl[idx].title, wl[idx].url, 1);
        app.views.bookmarksEdit.win.open(site);
      }
    });
    di.show();
  });
  pageBtn.addEventListener('click', function(e) {
    window.add(pv.pageView);
    window.toolbar = pv.toolbar;
    pv.open(wl);
    wl[idx].webView.transform = Ti.UI.create2DMatrix();
    window.add(wl[idx].webView);
    wl[idx].webView.animate({
      transform: Ti.UI.create2DMatrix().scale(0.5),
      duration: 400
    }, function() {
      window.hideNavBar();
      window.remove(wl[idx].webView);
    });
  });
  Ti.App.addEventListener('root.openURL', function(e) {
    _openURL(e.url);
  });
  Ti.App.addEventListener('root.reload', function(e) {
    wl[idx].webView.reload();
  });
  Ti.App.addEventListener('root.stopLoading', function(e) {
    wl[idx].webView.stopLoading();
  });
  Ti.App.addEventListener('root.addTable', function(e) {
    window.add(tv.tableView);
  });
  Ti.App.addEventListener('root.removeTable', function(e) {
    window.remove(tv.tableView);
  });
  Ti.App.addEventListener('root.addWebView', function(e) {
    _addWebView();
  });
  Ti.App.addEventListener('root.pageViewClosed', function(e) {
    idx = e.idx;
    window.toolbar = [backBtn, fs, fwdBtn, fs, actBtn, fs, bookmarkBtn, fs, pageBtn];
    wl[idx].webView.transform = Ti.UI.create2DMatrix().scale(0.5);
    window.add(wl[idx].webView);
    wl[idx].webView.animate({
      transform: Ti.UI.create2DMatrix(),
      duration: 400
    }, function() {
      window.remove(pv.pageView);
      _refreshWindow(wl[idx]);
      window.showNavBar();
    });
  });
  Ti.App.addEventListener('root.spliceWebViewList', function(e) {
    wl.splice(e.idx, 1);
  });
  win = {
    open: function() {
      var lastPage;
      lastPage = Ti.App.Properties.getString('lastPage');
      _addWebView();
      if (lastPage) {
        wl[idx].webView.url = lastPage;
      } else {
        wl[idx].webView.url = 'http://www.apple.com';
      }
      window.add(wl[idx].webView);
      tabGroup.open();
    }
  };
  return {
    win: win
  };
})();