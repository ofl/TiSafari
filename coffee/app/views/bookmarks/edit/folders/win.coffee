createWindow = (navGroup, data) ->
  Folder = app.models.Folder
  mix = app.helpers.util.mix
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.bookmarksEditFolders

  window = Ti.UI.createWindow mix $$.window,
    title: 'Bookmark'
  tableView = Ti.UI.createTableView $$.tableView
  window.add tableView
  doneBtn = Ti.UI.createButton
    systemButton: Ti.UI.iPhone.SystemButton.DONE
    
  window.setRightNavButton doneBtn
    
  do ->
    rows = [
      Ti.UI.createTableViewRow mix($$.tableViewRow, 
        title:'Bookmark'
        hasCheck: if data.parentid is -1 then true else false
        id: -1)
      ]
    folders = Folder.tree data
    for folder in folders
      rows.push Ti.UI.createTableViewRow mix($$.tableViewRow,
        title: folder.title
        id: folder.id
        hasCheck: if data.parentid is folder.id then true else false
        indentionLevel: folder.indent)      
    tableView.setData rows
    return

  doneBtn.addEventListener 'click', (e) -> 
    navGroup.close window
    window = null
    return      
      
  tableView.addEventListener 'click' , (e)->
    if data.parentid isnt e.row.id
      data.parentid = e.row.id
      data.position = -1
      data.save()
      Ti.App.fireEvent 'bookmarksEdit.updateFolderRow'    
    navGroup.close window
    return
    
  return window
              
win =
  open: (navGroup, data) ->
    window = createWindow(navGroup, data)
    navGroup.open window
    return

exports.win = win 