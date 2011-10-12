db = Ti.Database.open 'db'
db.execute "CREATE TABLE IF NOT EXISTS SITEDB (ID INTEGER PRIMARY KEY, TITLE TEXT, URL TEXT, UPDATED TEXT, LASTVISIT TEXT, STYPE INTEGER, PARENTID INTEGER, POSITION INTEGER)"

class Site
  constructor: (@title, @url, @stype = 0, @updated = -1, @id = null, @lastvisit = -1, @parentid = -1, @position = -1) ->    
        
  save: () ->
    date = (new Date()).getTime()
    if @stype > 0 and @position is -1
      rows = db.execute "SELECT ID FROM SITEDB WHERE STYPE > 0 AND PARENTID = ?", @parentid
      @position = rows.rowCount + 1
    if @id is null
      db.execute "INSERT INTO SITEDB (TITLE, URL, UPDATED, LASTVISIT, STYPE, PARENTID, POSITION ) VALUES(?,?,?,?,?,?,?)", @title, @url, date, @lastvisit, @stype, @parentid, @position
      @id = db.lastInsertRowId
    else
      db.execute "UPDATE SITEDB SET TITLE = ?,URL = ?,UPDATED = ?,LASTVISIT = ?,STYPE = ? ,PARENTID = ? ,POSITION = ?   WHERE id = ?", @title, @url, date, @lastvisit, @stype, @parentid, @position, @id
    @updated = date
    return this
    
  move: (newPos) ->
    oldPos = @position
    if newPos > oldPos
      db.execute('UPDATE SITEDB SET POSITION = POSITION - 1 WHERE PARENTID = ? AND POSITION > ? AND POSITION <= ?',@parentid, oldPos, newPos)
    else
      db.execute('UPDATE SITEDB SET POSITION = POSITION + 1 WHERE PARENTID = ? AND POSITION < ? AND POSITION >= ?',@parentid, oldPos, newPos)      
    @position = newPos
    @save()
    return
    
  del: () ->
    db.execute "DELETE FROM SITEDB WHERE id = ?", @id
    return null
    
  @findAll: (sql) ->
    results = []
    rows = db.execute sql    
    while rows.isValidRow()
      results.push
        title: rows.fieldByName('TITLE')
        url: rows.fieldByName('URL')
        stype: rows.fieldByName('STYPE')
        updated: parseInt(rows.fieldByName('UPDATED'), 10)
        id: rows.fieldByName('ID')
        lastvisit: rows.fieldByName('lastvisit')
        position: rows.fieldByName('position')
        parentid: rows.fieldByName('parentid')
      rows.next()
    rows.close()    
    return results
    
  @findOne: (sql) ->
    site = null
    rows = db.execute sql
    
    if rows.isValidRow()      
      f = rows.fieldByName
      site = new Site f('TITLE'), f('URL'), f('STYPE'), parseInt(f('UPDATED'), 10), f('ID'), parseInt(f('LASTVISIT'), 10), f('PARENTID'), f('POSITION')
    rows.close()    
    return site    
    
  @all: (parent) ->
    if parent?
      Site.findAll "SELECT * FROM SITEDB WHERE PARENTID = #{parent} AND STYPE > 0 ORDER BY POSITION LIMIT 1000"
    else
      Site.findAll "SELECT * FROM SITEDB WHERE PARENTID < 0 AND STYPE > 0 ORDER BY POSITION, UPDATED DESC LIMIT 1000"
    
  @findById: (id) ->
    Site.findOne "SELECT * FROM SITEDB WHERE ID = #{id}"
    
  @delAll: () ->
    db.execute "DELETE FROM SITEDB"
    return
    
class History extends Site
  @create: (title, url) ->
    d = new Date()
    today = '' + (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime()
    history = History.findOne "SELECT * FROM SITEDB WHERE LASTVISIT = '#{today}' AND URL = '#{url}' ORDER BY UPDATED DESC"
    if history?
      Ti.API.info 'kokk'
      history.updated = d.getTime()
      history.save()
    else
      Ti.API.info 'sokk'
      Ti.API.info today
      history = new History title, url
      history.lastvisit = '' + today
      history.save()
    return
    
  @findAllByTitle: (text) ->
    History.findAll "SELECT DISTINCT * FROM SITEDB WHERE STYPE < 2 AND TITLE LIKE '%#{text}%' LIMIT 10"
        
  @findAllByDate: (date) ->
    History.findAll "SELECT * FROM SITEDB WHERE STYPE = 0 AND LASTVISIT = '#{date}' ORDER BY UPDATED DESC LIMIT 1000"
    
  @findDateOfWeek: (today) ->
    date = today - 86400 * 1000 * 6
    results = []
    rows = db.execute "SELECT * FROM SITEDB WHERE UPDATED BETWEEN '#{date}' AND '#{today}' GROUP BY LASTVISIT"
    
    while rows.isValidRow()
      results.push
        lastvisit: parseInt(rows.fieldByName('LASTVISIT'), 10)
      rows.next()
    rows.close()    
    return results
    
  @delAll: () ->
    db.execute "DELETE FROM SITEDB WHERE stype < 1"
    return

class Folder extends Site
  constructor: (@title) ->    
    super @title, @url = '', @stype = 2
    
  del: () ->
    list = [@id]     
    findChild = (id)->
      sites = Site.all(id)
      for site in sites
        list.push site.id          
        findChild site.id
      return
    findChild @id
    db.execute "DELETE FROM SITEDB WHERE id IN (#{list.join ','})"
    return
        
  @tree: (data) ->
    id = if data.id? then data.id else -1
    tree = Site.findAll "SELECT * FROM SITEDB WHERE STYPE = 2 AND PARENTID < 0 AND id != #{id} ORDER BY PARENTID, POSITION"
    source = Site.findAll "SELECT * FROM SITEDB WHERE STYPE = 2 AND PARENTID > -1 AND id != #{id} ORDER BY PARENTID, POSITION"
    indent = 1
    results = null
    
    makeTree = (tree, source)->
      newTree = []
      newSource = []
      del = []
      for item in tree
        if !item.indent
          item.indent = indent
        newTree.push item
        if indent is 1 or item.indent is indent
          for src, i in source
            if src.parentid is item.id
              src.indent = indent + 1
              newTree.push src
              del.push i
      for sr,j in source
        if del.indexOf(j) is -1
          newSource.push sr              
      if newSource.length > 0 and newSource.length < source.length
        makeTree newTree, newSource
      else
        results = newTree
      indent += 1
      return
      
    makeTree(tree, source)
    return results

    
exports = 
  Site: Site
  History: History
  Folder: Folder

