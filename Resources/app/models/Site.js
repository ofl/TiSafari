var Folder, History, Site, db, exports;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
db = Ti.Database.open('db');
db.execute("CREATE TABLE IF NOT EXISTS SITEDB (ID INTEGER PRIMARY KEY, TITLE TEXT, URL TEXT, UPDATED TEXT, LASTVISIT TEXT, STYPE INTEGER, PARENTID INTEGER, POSITION INTEGER)");
Site = (function() {
  function Site(title, url, stype, updated, id, lastvisit, parentid, position) {
    this.title = title;
    this.url = url;
    this.stype = stype != null ? stype : 0;
    this.updated = updated != null ? updated : -1;
    this.id = id != null ? id : null;
    this.lastvisit = lastvisit != null ? lastvisit : -1;
    this.parentid = parentid != null ? parentid : -1;
    this.position = position != null ? position : -1;
  }
  Site.prototype.save = function() {
    var date, rows;
    date = (new Date()).getTime();
    if (this.stype > 0 && this.position === -1) {
      rows = db.execute("SELECT ID FROM SITEDB WHERE STYPE > 0 AND PARENTID = ?", this.parentid);
      this.position = rows.rowCount + 1;
    }
    if (this.id === null) {
      db.execute("INSERT INTO SITEDB (TITLE, URL, UPDATED, LASTVISIT, STYPE, PARENTID, POSITION ) VALUES(?,?,?,?,?,?,?)", this.title, this.url, date, this.lastvisit, this.stype, this.parentid, this.position);
      this.id = db.lastInsertRowId;
    } else {
      db.execute("UPDATE SITEDB SET TITLE = ?,URL = ?,UPDATED = ?,LASTVISIT = ?,STYPE = ? ,PARENTID = ? ,POSITION = ?   WHERE id = ?", this.title, this.url, date, this.lastvisit, this.stype, this.parentid, this.position, this.id);
    }
    this.updated = date;
    return this;
  };
  Site.prototype.move = function(newPos) {
    var oldPos;
    oldPos = this.position;
    if (newPos > oldPos) {
      db.execute('UPDATE SITEDB SET POSITION = POSITION - 1 WHERE PARENTID = ? AND POSITION > ? AND POSITION <= ?', this.parentid, oldPos, newPos);
    } else {
      db.execute('UPDATE SITEDB SET POSITION = POSITION + 1 WHERE PARENTID = ? AND POSITION < ? AND POSITION >= ?', this.parentid, oldPos, newPos);
    }
    this.position = newPos;
    this.save();
  };
  Site.prototype.del = function() {
    db.execute("DELETE FROM SITEDB WHERE id = ?", this.id);
    return null;
  };
  Site.findAll = function(sql) {
    var results, rows;
    results = [];
    rows = db.execute(sql);
    while (rows.isValidRow()) {
      results.push({
        title: rows.fieldByName('TITLE'),
        url: rows.fieldByName('URL'),
        stype: rows.fieldByName('STYPE'),
        updated: parseInt(rows.fieldByName('UPDATED'), 10),
        id: rows.fieldByName('ID'),
        lastvisit: rows.fieldByName('lastvisit'),
        position: rows.fieldByName('position'),
        parentid: rows.fieldByName('parentid')
      });
      rows.next();
    }
    rows.close();
    return results;
  };
  Site.findOne = function(sql) {
    var f, rows, site;
    site = null;
    rows = db.execute(sql);
    if (rows.isValidRow()) {
      f = rows.fieldByName;
      site = new Site(f('TITLE'), f('URL'), f('STYPE'), parseInt(f('UPDATED'), 10), f('ID'), parseInt(f('LASTVISIT'), 10), f('PARENTID'), f('POSITION'));
    }
    rows.close();
    return site;
  };
  Site.all = function(parent) {
    if (parent != null) {
      return Site.findAll("SELECT * FROM SITEDB WHERE PARENTID = " + parent + " AND STYPE > 0 ORDER BY POSITION LIMIT 1000");
    } else {
      return Site.findAll("SELECT * FROM SITEDB WHERE PARENTID < 0 AND STYPE > 0 ORDER BY POSITION, UPDATED DESC LIMIT 1000");
    }
  };
  Site.findById = function(id) {
    return Site.findOne("SELECT * FROM SITEDB WHERE ID = " + id);
  };
  Site.delAll = function() {
    db.execute("DELETE FROM SITEDB");
  };
  return Site;
})();
History = (function() {
  __extends(History, Site);
  function History() {
    History.__super__.constructor.apply(this, arguments);
  }
  History.create = function(title, url) {
    var d, history, today;
    d = new Date();
    today = '' + (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime();
    history = History.findOne("SELECT * FROM SITEDB WHERE LASTVISIT = '" + today + "' AND URL = '" + url + "' ORDER BY UPDATED DESC");
    if (history != null) {
      Ti.API.info('kokk');
      history.updated = d.getTime();
      history.save();
    } else {
      Ti.API.info('sokk');
      Ti.API.info(today);
      history = new History(title, url);
      history.lastvisit = '' + today;
      history.save();
    }
  };
  History.findAllByTitle = function(text) {
    return History.findAll("SELECT DISTINCT * FROM SITEDB WHERE STYPE < 2 AND TITLE LIKE '%" + text + "%' LIMIT 10");
  };
  History.findAllByDate = function(date) {
    return History.findAll("SELECT * FROM SITEDB WHERE STYPE = 0 AND LASTVISIT = '" + date + "' ORDER BY UPDATED DESC LIMIT 1000");
  };
  History.findDateOfWeek = function(today) {
    var date, results, rows;
    date = today - 86400 * 1000 * 6;
    results = [];
    rows = db.execute("SELECT * FROM SITEDB WHERE UPDATED BETWEEN '" + date + "' AND '" + today + "' GROUP BY LASTVISIT");
    while (rows.isValidRow()) {
      results.push({
        lastvisit: parseInt(rows.fieldByName('LASTVISIT'), 10)
      });
      rows.next();
    }
    rows.close();
    return results;
  };
  History.delAll = function() {
    db.execute("DELETE FROM SITEDB WHERE stype < 1");
  };
  return History;
})();
Folder = (function() {
  __extends(Folder, Site);
  function Folder(title) {
    this.title = title;
    Folder.__super__.constructor.call(this, this.title, this.url = '', this.stype = 2);
  }
  Folder.prototype.del = function() {
    var findChild, list;
    list = [this.id];
    findChild = function(id) {
      var site, sites, _i, _len;
      sites = Site.all(id);
      for (_i = 0, _len = sites.length; _i < _len; _i++) {
        site = sites[_i];
        list.push(site.id);
        findChild(site.id);
      }
    };
    findChild(this.id);
    db.execute("DELETE FROM SITEDB WHERE id IN (" + (list.join(',')) + ")");
  };
  Folder.tree = function(data) {
    var id, indent, makeTree, results, source, tree;
    id = data.id != null ? data.id : -1;
    tree = Site.findAll("SELECT * FROM SITEDB WHERE STYPE = 2 AND PARENTID < 0 AND id != " + id + " ORDER BY PARENTID, POSITION");
    source = Site.findAll("SELECT * FROM SITEDB WHERE STYPE = 2 AND PARENTID > -1 AND id != " + id + " ORDER BY PARENTID, POSITION");
    indent = 1;
    results = null;
    makeTree = function(tree, source) {
      var del, i, item, j, newSource, newTree, sr, src, _i, _len, _len2, _len3;
      newTree = [];
      newSource = [];
      del = [];
      for (_i = 0, _len = tree.length; _i < _len; _i++) {
        item = tree[_i];
        if (!item.indent) {
          item.indent = indent;
        }
        newTree.push(item);
        if (indent === 1 || item.indent === indent) {
          for (i = 0, _len2 = source.length; i < _len2; i++) {
            src = source[i];
            if (src.parentid === item.id) {
              src.indent = indent + 1;
              newTree.push(src);
              del.push(i);
            }
          }
        }
      }
      for (j = 0, _len3 = source.length; j < _len3; j++) {
        sr = source[j];
        if (del.indexOf(j) === -1) {
          newSource.push(sr);
        }
      }
      if (newSource.length > 0 && newSource.length < source.length) {
        makeTree(newTree, newSource);
      } else {
        results = newTree;
      }
      indent += 1;
    };
    makeTree(tree, source);
    return results;
  };
  return Folder;
})();
exports = {
  Site: Site,
  History: History,
  Folder: Folder
};