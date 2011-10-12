exports.createTitleControlAndTable = () ->
  History = app.models.History
  mix = app.helpers.util.mix
  trace = app.helpers.util.trace
  $$ = app.helpers.style.views.rootTableView
  
  focused = 'url' #url/search  
  
  titleControl = Ti.UI.createView $$.titleControl
  stopBtn = Ti.UI.createButton $$.stopBtn
  reloadBtn = Ti.UI.createButton $$.reloadBtn
  urlField = Ti.UI.createTextField mix $$.urlField,
    rightButton: reloadBtn
  searchField = Ti.UI.createTextField $$.searchField
  cancelBtn = Ti.UI.createButton $$.cancelBtn  
  
  titleControl.add searchField
  titleControl.add urlField
  titleControl.add cancelBtn

  modalView = Ti.UI.createView $$.modalView
  tableView = Ti.UI.createTableView $$.tableView
  
  modalView.add tableView
     
  _updateSearchRows = (text)->
    if Titanium.Network.online isnt false
      xhr = Titanium.Network.createHTTPClient()
      url = 'http://suggestqueries.google.com/complete/search?hl=ja&json=t&qu=' + text
      xhr.open 'GET', url
      xhr.onload = (e)-> 
        json = eval '(' + @responseText + ')'
        if json?
          data = json[1]
          rows = []
          for item in data
            rows.push Ti.UI.createTableViewRow mix $$.searchRow,
              title: item
          tableView.setData rows
          if data.length > 0
            tableView.visible = true
        return
      xhr.onerror = (error) ->
        alert error
        return
      xhr.send()
    else
        alert 'Network disconnected.'    
    return
     
  _updateSuggestRows = (text)->
    histories = History.findAllByTitle(text)
    if histories.length > 0
      rows = []
      for item in histories
        row = Ti.UI.createTableViewRow mix $$.suggestRow,
          url: item.url
        row.add Ti.UI.createLabel mix $$.suggestRowTitle,
          text: item.title
        row.add Ti.UI.createLabel mix $$.suggestRowURL,
          text: item.url
        rows.push row
      tableView.setData rows
      tableView.visible = true
    return

  _closeTable = (e) ->
    searchField.blur()
    urlField.blur()
    tableView.visible = false
    modalView.animate opacity: $$.modalView.opacity, ()->
      Ti.App.fireEvent 'root.removeTable'
      return
    if focused is 'url'
      searchField.show()
      urlField.animate width: 210
      cancelBtn.animate right: - 75
    else
      searchField.animate 
        width: 95
        right: 0
      urlField.animate left: 0
      cancelBtn.animate right: - 75    
    return

  _urlFieldHandler = (e) ->
    switch e.type
      when 'focus'
        focused = 'url'
        Ti.App.fireEvent 'root.addTable'
        setTimeout(()->
          modalView.animate opacity: 0.8
          searchField.hide()
          urlField.animate width: 240
          cancelBtn.animate right: 0
        , 100)
      when 'return'
        Ti.App.fireEvent 'root.openURL', url: urlField.value
        _closeTable()
      when 'change'
        if urlField.value.length > 0
          _updateSuggestRows urlField.value
    return

  _searchFieldHandler = (e) ->
    switch e.type
      when 'focus'
        focused = 'search'
        Ti.App.fireEvent 'root.addTable'
        setTimeout(()->
          modalView.animate opacity: 0.8
          searchField.animate 
            width: 230
            right: 75
          urlField.animate left: -220
          cancelBtn.animate right: 0
        , 100)
      when 'change'
        if searchField.value.length > 0
          _updateSearchRows searchField.value
    return

  _tableViewHandler = (e) ->
    switch e.type
      when 'scroll'
        searchField.blur()
        urlField.blur()
      when 'click'
        if focused is 'url'
          url = e.row.url
        else
          url = 'http://www.google.co.jp/search?hl=ja&site=&q=' + e.row.title     
        Ti.App.fireEvent 'root.openURL', url: url
        _closeTable()
    return

  urlField.addEventListener 'focus', _urlFieldHandler      
  urlField.addEventListener 'blur' , _urlFieldHandler
  urlField.addEventListener 'return' , _urlFieldHandler
  urlField.addEventListener 'change' , _urlFieldHandler
  searchField.addEventListener 'focus' , _searchFieldHandler
  searchField.addEventListener 'blur' , _searchFieldHandler
  searchField.addEventListener 'return' , _searchFieldHandler
  searchField.addEventListener 'change' , _searchFieldHandler
  tableView.addEventListener 'scroll' , _tableViewHandler
  tableView.addEventListener 'click' , _tableViewHandler
  cancelBtn.addEventListener 'click', _closeTable    
  
  reloadBtn.addEventListener 'click', (e) ->
    Ti.App.fireEvent 'root.reload'
    return
  
  stopBtn.addEventListener 'click', (e) ->
    Ti.App.fireEvent 'root.stopLoading'
    return

  Ti.App.addEventListener 'root.tableView.updateUrlField', (e) ->
    urlField.value = e.uri
    searchField.value = ''
    return
         
  return {titleControl: titleControl, tableView: modalView}
