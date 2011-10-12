do ->
  
#   最後に開いていたページ、top、edit、mailとid
  # Ti.App.Properties.removeProperty 'lastPage'
  if !Ti.App.Properties.hasProperty 'lastPage'
    Ti.App.Properties.setString 'lastPage', 'http://www.google.co.jp'

exports = {}
