exports = do ->
  Site = app.models.Site
  History = app.models.History
  mix = app.helpers.util.mix
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.root
  
  wl = []
  idx = 0
    
  fs = Ti.UI.createButton $$.fs
  backBtn = Ti.UI.createButton $$.backBtn
  fwdBtn = Ti.UI.createButton $$.fwdBtn
  bookmarkBtn = Ti.UI.createButton $$.bookmarkBtn
  pageBtn = Ti.UI.createButton $$.pageBtn
  actBtn = Ti.UI.createButton $$.actBtn
  
  tv = require('app/views/tableView').createTitleControlAndTable()  
  pv = require('app/views/pageView').createPageViewAndToolBar()
  
  window = Ti.UI.createWindow mix $$.window,
    titleControl: tv.titleControl
    toolbar: [backBtn, fs, fwdBtn, fs, actBtn, fs, bookmarkBtn, fs, pageBtn]
    
  tabGroup = Ti.UI.createTabGroup()
  tabGroup.addTab(Ti.UI.createTab window:window)
  
  _openURL = (url) ->    
    if url.match /^https?:\/\/.+$/
      wl[idx].webView.url = url
    else if url.match /^javascript:.+$/
      script = decodeURI url.substring(11)
      if script and script isnt ''
        try
          wl[idx].webView.evalJS script
        catch error 
          Ti.UI.createAlertDialog title: 'Script Error',  message: error.message
    else if url.match /^[a-zA-Z0-9]*:.+$/
      Ti.Platform.openURL url
    return

  _refreshWindow = (page) ->
    Ti.App.Properties.setString 'lastPage', page.url
    Ti.App.fireEvent 'root.tableView.updateUrlField', uri: page.url
    window.titlePrompt = page.title
    fwdBtn.enabled = if page.webView.canGoForward() then true else false
    backBtn.enabled = if page.webView.canGoBack() then true else false
    actBtn.enabled = true     
    return

  _webViewHandler = (e) ->
    wv = e.source
    page = wl[idx]
    switch e.type
      when 'beforeload'
        page.url = wv.evalJS 'document.URL'
        page.title = wv.evalJS 'document.title'
      when 'load'        
        page.url = wv.evalJS 'document.URL'
        page.title = wv.evalJS 'document.title'
        History.create(page.title, page.url)
        _refreshWindow page
    return

  _addWebView = ()->
    webView  = Ti.UI.createWebView zIndex:10
    webView.addEventListener 'beforeload' , _webViewHandler
    webView.addEventListener 'load' , _webViewHandler
    wl.push
      webView: webView
      title: 'No Name'
      url: ''
    return

  backBtn.addEventListener 'click', (e) ->
    wl[idx].webView.goBack()
    return
  
  fwdBtn.addEventListener 'click', (e) ->
    wl[idx].webView.goForward()
    return
  
  bookmarkBtn.addEventListener 'click', (e) ->
    app.views.bookmarks.win.open()
    return

  actBtn.addEventListener 'click', (e) -> 
    di = Ti.UI.createOptionDialog $$.optionDialog
    di.addEventListener 'click', (e)->
      if e.index is 0
        site = new Site wl[idx].title, wl[idx].url, 1
        app.views.bookmarksEdit.win.open site        
      return
    di.show()
    return

  pageBtn.addEventListener 'click', (e) -> 
    window.add pv.pageView
    window.toolbar = pv.toolbar
    pv.open wl
    wl[idx].webView.transform = Ti.UI.create2DMatrix()
    window.add wl[idx].webView
    wl[idx].webView.animate(
      transform: Ti.UI.create2DMatrix().scale 0.5
      duration: 400
      ,()->
        window.hideNavBar()
        window.remove wl[idx].webView 
        return
    ) 
    return
         
  Ti.App.addEventListener 'root.openURL', (e)->
    _openURL e.url
    return
  Ti.App.addEventListener 'root.reload', (e)->
    wl[idx].webView.reload()
    return
  Ti.App.addEventListener 'root.stopLoading', (e)->
    wl[idx].webView.stopLoading()
    return
  Ti.App.addEventListener 'root.addTable', (e)->
    window.add tv.tableView
    return
  Ti.App.addEventListener 'root.removeTable', (e)->
    window.remove tv.tableView
    return
  Ti.App.addEventListener 'root.addWebView', (e)->
    _addWebView()
    return
  Ti.App.addEventListener 'root.pageViewClosed', (e)->
    idx = e.idx
    window.toolbar = [backBtn, fs, fwdBtn, fs, actBtn, fs, bookmarkBtn, fs, pageBtn]
    wl[idx].webView.transform = Ti.UI.create2DMatrix().scale 0.5
    window.add wl[idx].webView
    wl[idx].webView.animate 
      transform:Ti.UI.create2DMatrix()
      duration:400
      , ()->
        window.remove pv.pageView
        _refreshWindow wl[idx]
        window.showNavBar()
        return
    return
  Ti.App.addEventListener 'root.spliceWebViewList', (e)->
    wl.splice e.idx, 1
    return
    
  win = 
    open: () ->    
      lastPage = Ti.App.Properties.getString 'lastPage'
      _addWebView()
      if lastPage
        wl[idx].webView.url = lastPage
      else      
        wl[idx].webView.url = 'http://www.apple.com'
      window.add wl[idx].webView
      tabGroup.open()
      return
  
  return win: win
 