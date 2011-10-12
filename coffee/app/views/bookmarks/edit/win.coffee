createWindow = (navGroup, windowStack, data) ->
  Site = app.models.Site
  mix = app.helpers.util.mix
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.bookmarksEdit
        
  window = Ti.UI.createWindow mix $$.window,
    title: if data.stype is 1 then 'Edit Bookmark' else 'Edit Folder'
    
  titleRow = Ti.UI.createTableViewRow $$.tableViewRow
  titleField = Ti.UI.createTextField mix $$.titleField,
    value: data.title
  titleRow.add titleField
  
  if data.stype is 1
    urlRow = Ti.UI.createTableViewRow $$.tableViewRow
    urlField = Ti.UI.createTextField mix $$.urlField,
      value: data.url
    urlRow.add urlField
    
  folderRow = Ti.UI.createTableViewRow mix $$.tableViewRow,
    header : ''
    hasChild: true
    
  tableView = Ti.UI.createTableView mix $$.tableView,
    data: if data.stype is 1 then [titleRow, urlRow, folderRow] else [titleRow, folderRow]
    
  window.add tableView
  
  if data.stype is 1 and (data.id is null or typeof data.id is 'undefined')
    urlField.editable = false
    saveBtn = Ti.UI.createButton $$.saveBtn
    cancelBtn = Ti.UI.createButton $$.cancelBtn
    window.setRightNavButton saveBtn  
    window.setLeftNavButton cancelBtn  
    _closeWindow = ()->
      windowStack[0].close()
      return      
  else
    _closeWindow = ()->
      navGroup.close window
      return

  updateFolderRow = ()->
    if data.parentid isnt -1
      folder = Site.findById data.parentid
      folderRow.title = folder.title
    else
      folderRow.title = 'Bookmark'
    return

  updateFolderRow()

  _updateData = ()->
    data.title = titleField.value
    if data.stype is 1
      data.url = urlField.value
    data.save()
    for window in windowStack
      trace 'done?' + windowStack.length + typeof window.updateTable
      if typeof window.updateTable is 'function'
        trace 'doneEDit'
        window.updateTable()
    # last = windowStack.length - 1
    # if typeof windowStack[0].updateTable is 'function'
      # windowStack[0].updateTable()
    return
    
  _textFieldHandler = (e)->
    _updateData()
    _closeWindow()
    return

  titleField.addEventListener 'return' , _textFieldHandler
  
  folderRow.addEventListener 'click' , ()->
    app.views.bookmarksEditFolders.win.open navGroup, data
    return

  if data.stype is 1 and (data.id is null or typeof data.id is 'undefined')
    saveBtn.addEventListener 'click', (e) -> 
      _updateData()
      _closeWindow()
      return
      
    cancelBtn.addEventListener 'click', (e) -> 
      if typeof data.id is 'number'
        data.del()
      _closeWindow()
      return      
      
    urlField.addEventListener 'return' , _textFieldHandler
  
  window.addEventListener 'open' , ()->
    setTimeout titleField.focus, 300
    return
  
  window.addEventListener 'close' , ()->   
    Ti.App.removeEventListener 'bookmarksEdit.updateFolderRow', updateFolderRow
    return
    
  Ti.App.addEventListener 'bookmarksEdit.updateFolderRow', updateFolderRow
    
    
  return window

              
win =
  open: (data) ->
    windowStack = [Ti.UI.createWindow navBarHidden: true]
    navGroup = Ti.UI.iPhone.createNavigationGroup()
    windowStack[0].add navGroup    
    window = createWindow navGroup, windowStack, data
    navGroup.window = window
    windowStack[0].open modal:true
    return
  openChild: (navGroup, windowStack, data) ->
    window = createWindow navGroup, windowStack, data
    navGroup.open window
    return

exports.win = win 