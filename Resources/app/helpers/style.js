var exports, mix, properties, theme, views;
mix = app.helpers.util.mix;
theme = {
  textColor: '#000000',
  blueText: '#336699',
  barColor: null,
  backgroundColor: '#fff',
  darkBlue: '#93caed',
  fontFamily: 'Helvetica Neue'
};
properties = {
  platformWidth: Ti.Platform.displayCaps.platformWidth,
  platformHeight: Ti.Platform.displayCaps.platformHeight,
  Window: {
    barColor: theme.barColor,
    backgroundColor: theme.backgroundColor,
    tabBarHidden: true,
    orientationModes: [Ti.UI.PORTRAIT]
  },
  Label: {
    color: theme.textColor,
    font: {
      fontFamily: theme.fontFamily,
      fontSize: 18
    },
    height: 'auto'
  },
  TableView: {
    backgroundColor: theme.backgroundColor,
    rowHeight: 44
  },
  TableViewRow: {
    height: 44,
    hasChild: true
  },
  GroupedTableView: {
    style: Ti.UI.iPhone.TableViewStyle.GROUPED,
    rowHeight: 40
  },
  GroupedTableViewRow: {
    selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
  },
  TextField: {
    borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    appearance: Ti.UI.KEYBOARD_APPEARANCE_DEFAULT,
    clearButtonMode: Ti.UI.INPUT_BUTTONMODE_ONFOCUS,
    autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
    keyboardType: Ti.UI.KEYBOARD_DEFAULT,
    returnKeyType: Ti.UI.RETURNKEY_DEFAULT,
    suppressReturn: false,
    height: 30
  },
  fs: {
    systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
  }
};
views = {
  root: {
    window: mix(properties.Window, {
      translucent: true,
      titlePrompt: 'No name'
    }),
    fs: properties.fs,
    actBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.ACTION,
      enabled: false
    },
    backBtn: {
      title: String.fromCharCode(0x25c0),
      enabled: false
    },
    fwdBtn: {
      title: String.fromCharCode(0x25b6),
      enabled: false
    },
    bookmarkBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.BOOKMARKS
    },
    pageBtn: {
      image: 'image/light_pages.png'
    },
    optionDialog: {
      options: ['Add To Bookmark', 'Cancel'],
      cancel: 1
    }
  },
  rootTableView: {
    titleControl: {
      height: 40,
      width: properties.platformWidth - 10
    },
    titleLabel: mix(properties.Label, {
      left: 5,
      top: 12,
      width: 200,
      color: '#8b4513',
      height: 20
    }),
    urlField: mix(properties.TextField, {
      rightButtonMode: Ti.UI.INPUT_BUTTONMODE_ONBLUR,
      keyboardType: Ti.UI.KEYBOARD_URL,
      returnKeyType: Ti.UI.RETURNKEY_GO,
      color: '#000',
      width: 210,
      left: 0
    }),
    searchField: mix(properties.TextField, {
      returnKeyType: Ti.UI.RETURNKEY_SEARCH,
      borderRadius: 20,
      width: 95,
      right: 0
    }),
    stopBtn: {
      title: 'X',
      width: 18,
      height: 18
    },
    reloadBtn: {
      title: String.fromCharCode(0x21a9),
      width: 18,
      height: 18
    },
    cancelBtn: {
      title: 'Cancel',
      height: 30,
      width: 65,
      right: -75
    },
    modalView: {
      backgroundColor: '#000',
      opacity: 0.5,
      zIndex: 20
    },
    tableView: {
      top: 0,
      height: 390,
      backgroundColor: '#eee',
      visible: false
    },
    suggestRow: properties.TableViewRow,
    suggestRowTitle: mix(properties.Label, {
      left: 5,
      top: 5,
      width: 300,
      height: 18,
      font: {
        fontWeight: 'bold',
        fontSize: 16
      }
    }),
    suggestRowURL: mix(properties.Label, {
      left: 5,
      top: 25,
      width: 300,
      height: 18,
      color: '#999',
      font: {
        fontFamily: {
          fontSize: 14
        }
      }
    }),
    searchRow: mix(properties.TableViewRow, {
      color: '#000',
      font: {
        fontFamily: 'TrebuchetMS',
        fontSize: 16
      }
    })
  },
  rootPageView: {
    newBtn: {
      style: Ti.UI.iPhone.SystemButtonStyle.BORDERED,
      title: 'New Page'
    },
    doneBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.DONE
    },
    fs: properties.fs,
    scrollView: {
      showPagingControl: true,
      clipViews: false,
      top: 83,
      height: 250,
      width: 200
    },
    container: {
      zIndex: 5,
      backgroundColor: '#778899'
    },
    sideView: {
      top: 83,
      height: 250,
      width: 60
    },
    dummyView: {
      top: 93,
      left: -130,
      height: 230,
      width: 180
    },
    frameView: {
      height: 230,
      width: 180
    },
    imageView: {
      top: 10,
      left: 10,
      height: 210,
      width: 160,
      image: 'image/white.gif',
      title: '',
      uri: ''
    },
    titleLabel: mix(properties.Label, {
      left: 10,
      top: 30,
      width: 300,
      color: '#fff',
      font: {
        fontFamily: 'TrebuchetMS',
        fontSize: 20
      },
      textAlign: 'center',
      height: 24
    }),
    urlLabel: mix(properties.Label, {
      left: 10,
      top: 64,
      width: 300,
      color: '#bbb',
      font: {
        fontFamily: 'TrebuchetMS',
        fontSize: 16
      },
      textAlign: 'center',
      height: 16
    }),
    delBtn: {
      text: 'X',
      top: 0,
      left: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#fff',
      color: '#fff',
      backgroundColor: '#900',
      textAlign: 'center'
    }
  },
  bookmarks: {
    window: properties.Window,
    fs: properties.fs,
    newBtn: {
      style: Ti.UI.iPhone.SystemButtonStyle.BORDERED,
      title: 'New Folder'
    },
    editBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.EDIT
    },
    doneBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.DONE
    },
    delBtn: {
      style: Ti.UI.iPhone.SystemButtonStyle.BORDERED,
      title: 'Delete'
    },
    tableView: {
      editable: true,
      moveable: true,
      allowsSelectionDuringEditing: true
    },
    tableViewRow: properties.TableViewRow
  },
  bookmarksEdit: {
    window: properties.Window,
    saveBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.SAVE
    },
    cancelBtn: {
      systemButton: Ti.UI.iPhone.SystemButton.CANCEL
    },
    tableView: {
      style: Ti.UI.iPhone.TableViewStyle.GROUPED,
      rowHeight: 44
    },
    tableViewRow: mix(properties.TableViewRow, {
      color: theme.blueText,
      hasChild: false
    }),
    titleField: mix(properties.TextField, {
      borderStyle: Ti.UI.INPUT_BORDERSTYLE_NONE,
      returnKeyType: Ti.UI.RETURNKEY_DONE,
      color: theme.blueText,
      height: 35,
      width: 280,
      left: 10
    }),
    urlField: mix(properties.TextField, {
      borderStyle: Ti.UI.INPUT_BORDERSTYLE_NONE,
      keyboardType: Ti.UI.KEYBOARD_URL,
      returnKeyType: Ti.UI.RETURNKEY_DONE,
      color: '#999',
      height: 35,
      width: 280,
      left: 10
    })
  },
  bookmarksEditFolders: {
    window: properties.Window,
    tableView: properties.TableView,
    tableViewRow: mix(properties.TableViewRow, {
      hasChild: false,
      leftImage: 'image/dark_folder.png'
    }),
    label: mix(properties.Label, {
      top: 12,
      width: 280,
      color: '#000',
      height: 20
    }),
    imageView: {
      image: 'image/dark_folder.png',
      width: 20,
      height: 20
    }
  }
};
exports = {
  views: views
};