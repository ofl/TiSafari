exports = 

#デバッグ用及びメモリの使用量を確認 
  trace: (message) ->
    Ti.API.info message
    Ti.API.info "Available memory: " + Ti.Platform.availableMemory
    return

#オブジェクトを結合。例) mix({color:'#000', height:100}, {width:50, top:10})
  mix: () ->
    child = {}
    for arg in arguments
      for prop of arg
        if arg.hasOwnProperty prop
          child[prop] = arg[prop]
    return child
    
  prettyDate: (date) ->
      week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']      
      d = new Date()
      d.setTime(date)
      year = d.getFullYear()
      month = d.getMonth() + 1
      day = d.getDate()
      dayOfWeek = week[d.getDay()]
  
      return "#{year}/#{month}/#{day} (#{dayOfWeek})"
