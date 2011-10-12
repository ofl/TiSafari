exports.createPageViewAndToolBar = () ->
  mix = app.helpers.util.mix
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.rootPageView
    
  vl = []
  idx = 0
  startClick = false
  delClick = false
  
  fs = Ti.UI.createButton $$.fs
  newBtn = Ti.UI.createButton $$.newBtn
  doneBtn = Ti.UI.createButton $$.doneBtn
  toolbar = [newBtn, fs, doneBtn]
  
  scrollView = Ti.UI.createScrollableView $$.scrollView
  titleLabel = Ti.UI.createLabel $$.titleLabel
  urlLabel = Ti.UI.createLabel $$.urlLabel 
  sideViewLeft = Ti.UI.createView mix $$.sideView,
    left: 0
  sideViewRight = Ti.UI.createView mix $$.sideView,
    right: 0
  container = Ti.UI.createView $$.container
  container.add scrollView
  container.add titleLabel
  container.add urlLabel
  container.add sideViewLeft
  container.add sideViewRight

  _close = () -> 
    vl[idx].hide()
    Ti.App.fireEvent 'root.pageViewClosed', idx: idx 
    return

  _imageViewHandler = (e)->
    switch e.type
      when 'touchstart'
        startClick = true
      when 'touchend'
        if startClick
          startClick = false
          _close()
    return

  _delBtnHandler = (e)->
    switch e.type
      when 'touchstart'
        delClick = true
      when 'touchend'
        if delClick
          delClick = false
          Ti.App.fireEvent 'root.spliceWebViewList', idx: idx 
          vl[idx].hide()
          if idx < vl.length - 1
            if idx > 0
              image = vl[idx - 1].toImage()
              dummyView = Ti.UI.createImageView mix $$.dummyView,
                image: image
              container.add dummyView
            scrollView.scrollToView(idx + 1)
            setTimeout ()->
              scrollView.removeView idx - 1
              vl.splice (idx-1), 1 
              idx -= 1
              scrollView.views = vl
              scrollView.currentPage = idx
              if idx > 0
                container.remove dummyView                  
              return
            , 800
          else
            if vl.length > 1
              scrollView.scrollToView(idx - 1)
              setTimeout ()->
                vl.splice idx + 1, 1 
                scrollView.views = vl
                if vl.length < 2
                  _close()
              , 800
            else
              _createView()
              Ti.App.fireEvent 'root.addWebView' 
              scrollView.setViews vl    
              scrollView.scrollToView(vl.length - 1)
              setTimeout ()->
                scrollView.removeView vl[0]
                vl.splice 0, 1
                idx = 0
                _close()
              , 800
    return

  _createView = ()->
    frameView = Ti.UI.createView $$.frameView
    imageView =  Ti.UI.createImageView $$.imageView  
    delBtn = Ti.UI.createLabel $$.delBtn
    imageView.addEventListener 'touchstart', _imageViewHandler
    imageView.addEventListener 'touchend', _imageViewHandler
    delBtn.addEventListener 'touchstart', _delBtnHandler
    delBtn.addEventListener 'touchend', _delBtnHandler
    frameView.add imageView
    frameView.add delBtn
    vl.push frameView
    return

  open = (wl)->
    if vl.length is 0
      _createView()
    newBtn.enabled = if vl.length > 3 then false else true
    img = wl[idx].webView.toImage()
    view = vl[idx]
    view.show()
    view.getChildren()[0].image = img
    view.title = wl[idx].title
    view.uri = wl[idx].url
    scrollView.views = vl
    titleLabel.text = view.title
    urlLabel.text = view.uri
    return

  newBtn.addEventListener 'click', (e) -> 
    if vl.length > 3
      newBtn.enabled = false
    _createView()
    Ti.App.fireEvent 'root.addWebView' 
    scrollView.setViews vl    
    scrollView.scrollToView(vl.length - 1)
    setTimeout _close, 800
    return

  sideViewLeft.addEventListener 'click', (e) -> 
    if idx > 0
      scrollView.scrollToView(idx - 1)
    return

  sideViewRight.addEventListener 'click', (e) -> 
    if idx < vl.length - 1
      scrollView.scrollToView(idx + 1)
    return

  doneBtn.addEventListener 'click', _close
  
  scrollView.addEventListener 'scroll', (e) ->
    startClick = false
    idx = e.currentPage
    e.view.getChildren()[0].opacity = 1
    e.view.getChildren()[1].opacity = 1
    if idx > 0
      vl[idx - 1].getChildren()[0].opacity = 0.5
      vl[idx - 1].getChildren()[1].opacity = 0
    if idx < vl.length - 1
      vl[idx + 1].getChildren()[0].opacity = 0.5
      vl[idx + 1].getChildren()[1].opacity = 0
    titleLabel.text = e.view.title
    urlLabel.text = e.view.uri
    return
     
  return {pageView: container, toolbar: toolbar, open: open}

