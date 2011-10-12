createWindow = (navGroup, windowStack, folder = null) ->
  Site = app.models.Site
  Folder = app.models.Folder
  mix = app.helpers.util.mix
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.bookmarks
  
  isEditing = false
  
  fs = Ti.UI.createButton $$.fs
  editBtn = Ti.UI.createButton $$.editBtn
  doneBtn = Ti.UI.createButton $$.doneBtn
  editDoneBtn = Ti.UI.createButton $$.doneBtn
  newBtn = Ti.UI.createButton $$.newBtn
        
  window = Ti.UI.createWindow mix $$.window,
    title: if folder? then folder.title else 'Bookmarks'
    toolbar: [editBtn, fs]  
  tableView = Ti.UI.createTableView $$.tableView
  window.setRightNavButton doneBtn  
  window.add tableView
    
  updateTable = () ->
    rows = []
    if folder is null
      rows.push Ti.UI.createTableViewRow mix $$.tableViewRow,
        title: 'History'
        hasChild: true
        leftImage: 'image/dark_folder.png'        
      sites = Site.all()
    else
      sites = Site.all folder.id
    
    for site in sites
      rows.push Ti.UI.createTableViewRow mix $$.tableViewRow,
        id: site.id
        title: site.title
        url: site.url
        hasChild: if site.stype > 1 then true else false
        leftImage: if site.stype > 1 then 'image/dark_folder.png' else null      
    tableView.setData rows
    return

  _closeAll = ()->
    windowStack[0].close()    
    while windowStack.length > 1
      # navGroup.close windowStack.pop(), animated: false
      windowStack.pop().close()
    return

  _tableViewHandler = (e)->
    switch e.type
      when 'click'
        if isEditing
          if typeof e.row.id is 'number'
            data = Site.findById e.row.id
            app.views.bookmarksEdit.win.openChild navGroup, windowStack, data
        else
          if e.row.hasChild
            if typeof e.row.id is 'number'
              childfolder = Folder.findById e.row.id
              win.openChild navGroup, windowStack, childfolder
            else
              app.views.bookmarksHistories.win.open navGroup, windowStack
          else
            Ti.App.fireEvent 'root.openURL', url: e.row.url    
            _closeAll()
      when 'delete'
        if typeof e.row.id isnt 'undefined'
          if e.row.hasChild
            data = Folder.findById e.row.id
          else
            data = Site.findById e.row.id
          data.del()
      when 'move'
        if typeof e.row.id isnt 'undefined'
          data = Site.findById e.row.id
          if folder is null
            data.move e.index
          else
            data.move e.index + 1
    return

  tableView.addEventListener 'click' , _tableViewHandler
  tableView.addEventListener 'delete' , _tableViewHandler
  tableView.addEventListener 'move' , _tableViewHandler
  
  doneBtn.addEventListener 'click', (e) -> 
    _closeAll()
    return

  editBtn.addEventListener 'click', (e) -> 
    isEditing = true
    window.setRightNavButton null
    window.toolbar = [editDoneBtn, fs, newBtn] 
    tableView.editing = true
    tableView.moving = true
    return

  editDoneBtn.addEventListener 'click', (e) -> 
    isEditing = false
    window.setRightNavButton doneBtn
    window.toolbar = [editBtn, fs]    
    tableView.editing = false
    tableView.moving = false
    return

  newBtn.addEventListener 'click', (e) -> 
    newfolder = new Folder 'New Folder'
    app.views.bookmarksEdit.win.openChild navGroup, windowStack, newfolder        
    return

  window.updateTable = updateTable
  
  return window
  
win =
  open: () ->
    windowStack = [Ti.UI.createWindow navBarHidden: true]
    navGroup = Ti.UI.iPhone.createNavigationGroup()
    window = createWindow navGroup, windowStack
    windowStack.push window
    window.updateTable()
    navGroup.window = window
    windowStack[0].add navGroup
    windowStack[0].open modal:true
    return
    
  openChild: (navGroup, windowStack, folder) ->
    window = createWindow navGroup, windowStack, folder    
    window.updateTable()
    windowStack.push window
    window.addEventListener 'close', (e) -> 
      windowStack.pop()
      return    
    navGroup.open window
    return

exports.win = win  