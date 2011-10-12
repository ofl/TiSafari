exports.createPageViewAndToolBar = function() {
  var $$, container, delClick, doneBtn, fs, idx, mix, newBtn, open, scrollView, sideViewLeft, sideViewRight, startClick, titleLabel, toolbar, trace, urlLabel, vl, _close, _createView, _delBtnHandler, _imageViewHandler;
  mix = app.helpers.util.mix;
  trace = app.helpers.util.trace;
  $$ = app.helpers.style.views.rootPageView;
  vl = [];
  idx = 0;
  startClick = false;
  delClick = false;
  fs = Ti.UI.createButton($$.fs);
  newBtn = Ti.UI.createButton($$.newBtn);
  doneBtn = Ti.UI.createButton($$.doneBtn);
  toolbar = [newBtn, fs, doneBtn];
  scrollView = Ti.UI.createScrollableView($$.scrollView);
  titleLabel = Ti.UI.createLabel($$.titleLabel);
  urlLabel = Ti.UI.createLabel($$.urlLabel);
  sideViewLeft = Ti.UI.createView(mix($$.sideView, {
    left: 0
  }));
  sideViewRight = Ti.UI.createView(mix($$.sideView, {
    right: 0
  }));
  container = Ti.UI.createView($$.container);
  container.add(scrollView);
  container.add(titleLabel);
  container.add(urlLabel);
  container.add(sideViewLeft);
  container.add(sideViewRight);
  _close = function() {
    vl[idx].hide();
    Ti.App.fireEvent('root.pageViewClosed', {
      idx: idx
    });
  };
  _imageViewHandler = function(e) {
    switch (e.type) {
      case 'touchstart':
        startClick = true;
        break;
      case 'touchend':
        if (startClick) {
          startClick = false;
          _close();
        }
    }
  };
  _delBtnHandler = function(e) {
    var dummyView, image;
    switch (e.type) {
      case 'touchstart':
        delClick = true;
        break;
      case 'touchend':
        if (delClick) {
          delClick = false;
          Ti.App.fireEvent('root.spliceWebViewList', {
            idx: idx
          });
          vl[idx].hide();
          if (idx < vl.length - 1) {
            if (idx > 0) {
              image = vl[idx - 1].toImage();
              dummyView = Ti.UI.createImageView(mix($$.dummyView, {
                image: image
              }));
              container.add(dummyView);
            }
            scrollView.scrollToView(idx + 1);
            setTimeout(function() {
              scrollView.removeView(idx - 1);
              vl.splice(idx - 1, 1);
              idx -= 1;
              scrollView.views = vl;
              scrollView.currentPage = idx;
              if (idx > 0) {
                container.remove(dummyView);
              }
            }, 800);
          } else {
            if (vl.length > 1) {
              scrollView.scrollToView(idx - 1);
              setTimeout(function() {
                vl.splice(idx + 1, 1);
                scrollView.views = vl;
                if (vl.length < 2) {
                  return _close();
                }
              }, 800);
            } else {
              _createView();
              Ti.App.fireEvent('root.addWebView');
              scrollView.setViews(vl);
              scrollView.scrollToView(vl.length - 1);
              setTimeout(function() {
                scrollView.removeView(vl[0]);
                vl.splice(0, 1);
                idx = 0;
                return _close();
              }, 800);
            }
          }
        }
    }
  };
  _createView = function() {
    var delBtn, frameView, imageView;
    frameView = Ti.UI.createView($$.frameView);
    imageView = Ti.UI.createImageView($$.imageView);
    delBtn = Ti.UI.createLabel($$.delBtn);
    imageView.addEventListener('touchstart', _imageViewHandler);
    imageView.addEventListener('touchend', _imageViewHandler);
    delBtn.addEventListener('touchstart', _delBtnHandler);
    delBtn.addEventListener('touchend', _delBtnHandler);
    frameView.add(imageView);
    frameView.add(delBtn);
    vl.push(frameView);
  };
  open = function(wl) {
    var img, view;
    if (vl.length === 0) {
      _createView();
    }
    newBtn.enabled = vl.length > 3 ? false : true;
    img = wl[idx].webView.toImage();
    view = vl[idx];
    view.show();
    view.getChildren()[0].image = img;
    view.title = wl[idx].title;
    view.uri = wl[idx].url;
    scrollView.views = vl;
    titleLabel.text = view.title;
    urlLabel.text = view.uri;
  };
  newBtn.addEventListener('click', function(e) {
    if (vl.length > 3) {
      newBtn.enabled = false;
    }
    _createView();
    Ti.App.fireEvent('root.addWebView');
    scrollView.setViews(vl);
    scrollView.scrollToView(vl.length - 1);
    setTimeout(_close, 800);
  });
  sideViewLeft.addEventListener('click', function(e) {
    if (idx > 0) {
      scrollView.scrollToView(idx - 1);
    }
  });
  sideViewRight.addEventListener('click', function(e) {
    if (idx < vl.length - 1) {
      scrollView.scrollToView(idx + 1);
    }
  });
  doneBtn.addEventListener('click', _close);
  scrollView.addEventListener('scroll', function(e) {
    startClick = false;
    idx = e.currentPage;
    e.view.getChildren()[0].opacity = 1;
    e.view.getChildren()[1].opacity = 1;
    if (idx > 0) {
      vl[idx - 1].getChildren()[0].opacity = 0.5;
      vl[idx - 1].getChildren()[1].opacity = 0;
    }
    if (idx < vl.length - 1) {
      vl[idx + 1].getChildren()[0].opacity = 0.5;
      vl[idx + 1].getChildren()[1].opacity = 0;
    }
    titleLabel.text = e.view.title;
    urlLabel.text = e.view.uri;
  });
  return {
    pageView: container,
    toolbar: toolbar,
    open: open
  };
};