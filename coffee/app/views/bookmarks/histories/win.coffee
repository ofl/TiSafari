createWindow = (navGroup, windowStack, date) ->
  History = app.models.History
  mix = app.helpers.util.mix
  prettyDate = app.helpers.util.prettyDate
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.bookmarks
  
  isEditing = false

  fs = Ti.UI.createButton $$.fs
  delBtn = Ti.UI.createButton $$.delBtn
  doneBtn = Ti.UI.createButton $$.doneBtn
        
  tableView = Ti.UI.createTableView $$.tableView
  
  window = Ti.UI.createWindow mix $$.window,
    toolbar: [delBtn, fs] 
    title: if date? then prettyDate(date) else 'Histories'
  window.setRightNavButton doneBtn  
  window.add tableView
    
  do (date) ->
    rows = []
    if date?
      histories = History.findAllByDate date
      for history in histories
        row = Ti.UI.createTableViewRow mix $$.tableViewRow,
          id: history.id
          title: history.title
          url: history.url
          hasChild: false
        rows.push row
    else
      d = new Date()
      today = (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime()
      trace today
      histories = History.findAllByDate today
      for history, i in histories
        trace 'ahooo'
        rows.push Ti.UI.createTableViewRow mix $$.tableViewRow,
          id: history.id
          title: history.title
          url: history.url
          hasChild: false
        if i > 5
          rows.push Ti.UI.createTableViewRow mix $$.tableViewRow,
            title: prettyDate today
            lastvisit: today
          break
          
      folders = History.findDateOfWeek(today).reverse()
      for folder in folders
        rows.push Ti.UI.createTableViewRow mix $$.tableViewRow,
          title: prettyDate folder.lastvisit
          lastvisit: folder.lastvisit
      
    tableView.setData rows
    return

  _closeAll = ()->
    windowStack[0].close()    
    while windowStack.length > 1
      # navGroup.close windowStack.pop(), animated: false
      windowStack.pop().close()
    return
    
  tableView.addEventListener 'click' , (e)->
    if e.row.hasChild
      win.open navGroup, windowStack, e.row.lastvisit
    else
      Ti.App.fireEvent 'root.openURL', url: e.row.url    
      _closeAll()
    return
    
  delBtn.addEventListener 'click' , (e)->
    History.delAll()
    navGroup.close window
    return

  doneBtn.addEventListener 'click', (e) -> 
    _closeAll()
    return
    
  return window
              
win =
  open: (navGroup, windowStack, date) ->
    window = createWindow navGroup, windowStack, date
    windowStack.push window
    window.addEventListener 'close', (e) -> 
      windowStack.pop()
      return    
    navGroup.open window
    return

exports.win = win 