var highlightSelection = true
var saved = false
var model

var es = {
  js: {
    ace: ace.edit('jsedit'),
    typeTimer: -1,
    saveTimer: -1,
    container: document.querySelector('#jscon'),
    dropzone: document.querySelector('#jscon .dropzone'),
    check: document.querySelector('#jscheck')
  },
  css: {
    ace: ace.edit('cssedit'),
    typeTimer: -1,
    saveTimer: -1,
    container: document.querySelector('#csscon'),
    dropzone: document.querySelector('#csscon .dropzone'),
    check: document.querySelector('#csscheck')
  },
  html: {
    ace: ace.edit('htmledit'),
    typeTimer: -1,
    saveTimer: -1,
    container: document.querySelector('#htmlcon'),
    dropzone: document.querySelector('#htmlcon .dropzone'),
    check: document.querySelector('#htmlcheck')
  }
}
model = new Model(template, onModelChange)
es.html.ace.setValue(template.html, -1)
es.js.ace.setValue(template.js, -1)
es.css.ace.setValue(template.css, -1)
highlightSelection = model.highlightElement;

es.js.ace.getSession().setMode('ace/mode/javascript')
es.js.ace.getSession().setTabSize(2)
es.js.ace.getSession().setUseSoftTabs(true)
es.css.ace.getSession().setMode('ace/mode/css')
es.html.ace.getSession().setMode('ace/mode/html')

function getSurroundingHtmlElement (text) {
  var stack = []
  var str = text
  var cursor = es.html.ace.env.editor.getCursorPosition()
  var n = cursor.row
  var L = str.length, cursorPosition = -1
  while (n-- && cursorPosition++<L) {
    cursorPosition = str.indexOf('\n', cursorPosition)
    if (i < 0) {
      break
    }
  }
  cursorPosition += cursor.column
  for (var j=0; j<text.length-1; j++) {
    if (j === cursorPosition) {
      break
    }
    var c = text.charAt(j)
    if (c === '<' && text.charAt(j+1) === '/') {
      stack.pop()
    } else if (c === '<') {
      stack.push(j)
    }
  }
  if (stack.length === 0) {
    return text
  } else {
    var t = 0;
    for (t=stack.pop(); t<text.length; t++) {
      if (text.charAt(t) === '>') {
        break
      }
    }
    var pos = t
    return text.slice(0, pos) + ' data-upcrash' + text.slice(pos)
  }
}

es.html.ace.env.editor.selection.on('changeCursor', function () {
  if (highlightSelection) {
    resetIframe()
  }
})

for (let e in es) {
  es[e].ace.setShowPrintMargin(false)
  es[e].ace.getSession().setUseWrapMode(true)
  es[e].ace.setTheme('ace/theme/monokai')

  es[e].ace.on('change', function () {
    clearTimeout(es[e].typeTimer)
    clearTimeout(es[e].saveTimer)
    es[e].typeTimer = setTimeout(function () {
      updateModel()
    }, 1000)
    var range = es.html.ace.env.editor.find('<',
      {
        preventScroll: true,
        backwards: false
      }
    )
  })
}

var result = document.getElementById('result')
function resetIframe () {
  var iframe = document.getElementsByTagName('iframe')[0]
  iframe.src = `https://upcrash-serve.herokuapp.com/${id}`
  resizeIframe(dims[0].value, dims[1].value)
}

// RESIZE IFRAME
var fullSize = document.getElementById('fullsize')
var resultPop = document.getElementById('resultpop')
var dims = document.getElementsByClassName('iframedim')
function setResultSize () {
  var iframe = document.getElementsByTagName('iframe')[0]
  dims[0].value = iframe.offsetWidth
  dims[1].value = iframe.offsetHeight
}
for (var t = 0; t<dims.length; t++) {
  dims[t].addEventListener('keydown', (e) => {
    var parsed = parseInt(e.key)
    if (e.keyCode === 8 || e.keyCode === 39 || e.keyCode === 37 || (e.keyCode === 65 && e.ctrlKey) || e.keyCode === 9) {
    } else if (isNaN(parsed)) {
      e.preventDefault()
    }
  })
  dims[t].addEventListener('input', (e) => {
    var rwidth = result.offsetWidth
    var rheight = result.offsetHeight
    var iframe = document.getElementsByTagName('iframe')[0]
    if (parseInt(dims[0].value) > parseInt(dims[1].value)) {
      if (parseInt(dims[0].value) > rwidth) {
        iframe.style.transform = 'scale('+rwidth/dims[0].value+')'
      } else {
        iframe.style.transform = 'scale(1)'
      }
    } else {
      if (parseInt(dims[1].value) > rheight) {
        iframe.style.transform = 'scale('+rheight/dims[1].value+')'
      } else {
        iframe.style.transform = 'scale(1)'
      }
    }
    resizeIframe(dims[0].value, dims[1].value)
  })
}
function resizeIframe (width, height) {
  var iframe = document.getElementsByTagName('iframe')[0]

  var rwidth = result.offsetWidth
  iframe.style.width = width+'px'

  var rheight = result.offsetHeight
  iframe.style.height = height+'px'
  if (rwidth > rheight) {
    if (width > rwidth) {
      iframe.style.transform = 'scale('+rwidth/width+')'
    } else {
      iframe.style.transform = 'scale(1)'
    }
  } else {
    if (height > rheight) {
      iframe.style.transform = 'scale('+rheight/height+')'
    } else {
      iframe.style.transform = 'scale(1)'
    }
  }
}

result.addEventListener('mouseenter', function () {
  setResultSize()
  resultPop.style.display = 'block'
})
result.addEventListener('mouseleave', function () {
  resultPop.style.display = 'none'
})
var refresh = document.getElementById('refresh')
refresh.addEventListener('click', function () {
  resetIframe()
})

var fullSize = document.getElementById('fullsize')
fullSize.addEventListener('click', function () {
  var iframe = document.getElementsByTagName('iframe')[0]
  iframe.style.transform = 'scale(1)'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  dims[0].value = iframe.offsetWidth
  dims[1].value = iframe.offsetHeight
})

//// Presets
var presets = document.getElementsByClassName('preset')
for (var i=0; i<presets.length; i++) {
  presets[i].addEventListener('click', (e) => {
    var pwidth = e.target.getAttribute('data-pwidth'), pheight = e.target.getAttribute('data-pheight')
    resizeIframe(pwidth, pheight)
    setResultSize(pwidth, pheight)
  })
}


// LAYOUT
var contentBody = document.getElementById('body')
var numEditors = contentBody.children.length-1
if (!model.htmlShow) {
  hideHtmlEditor(numEditors)
}
numEditors = contentBody.children.length-1
if (!model.jsShow) {
  hideJsEditor(numEditors)
}
numEditors = contentBody.children.length-1
if (!model.cssShow) {
  hideCssEditor(numEditors)
}
var checkBoxes = document.getElementsByClassName('check')
for (var i=0; i<checkBoxes.length; i++) {
  var el = checkBoxes[i]
  el.addEventListener('change', (e) => {
    var numEditors = contentBody.children.length-1
    if (e.target.checked) {
      es.js.check.disabled = false
      es.css.check.disabled = false
      es.html.check.disabled = false
      switch (e.target.id) {
        case 'jscheck':
          showJsEditor(numEditors)
          break
        case 'csscheck':
          showCssEditor(numEditors)
          break
        case 'htmlcheck':
          showHtmlEditor(numEditors)
          break
      }
    } else {
      switch (e.target.id) {
        case 'jscheck':
          hideJsEditor(numEditors)
          break
        case 'csscheck':
          hideCssEditor(numEditors)
          break
        case 'htmlcheck':
          hideHtmlEditor(numEditors)
          break
      }
    }
    es.js.ace.resize()
    es.css.ace.resize()
    es.html.ace.resize()
  })
}

function showJsEditor (numEditors) {
  model.setProp('jsShow', true)
  if (numEditors === 2) {
    es.js.container.style.top = '0%'
    es.js.container.style.bottom = '66.66%'
    es.css.container.style.top = '33.33%';
    es.css.container.style.bottom = '33.33%';
    es.html.container.style.top = '66.66%';
    es.html.container.style.bottom = '0%';
  } else {
    es.js.container.style.top = '0%'
    es.js.container.style.bottom = '50%'
    contentBody.firstElementChild.style.top = '50%'
    contentBody.firstElementChild.style.bottom = '0%'
  }
  contentBody.insertBefore(es.js.container, contentBody.firstChild)
}

function showHtmlEditor (numEditors) {
  model.setProp('htmlShow', true)
  if (numEditors === 2) {
    es.js.container.style.top = '0%';
    es.js.container.style.bottom = '66.66%';
    es.css.container.style.top = '33.33%';
    es.css.container.style.bottom = '33.33%';
    es.html.container.style.top = '66.66%'
    es.html.container.style.bottom = '0%'
  } else {
    es.html.container.style.top = '50%'
    es.html.container.style.bottom = '0%'
    contentBody.firstElementChild.style.top = '0%'
    contentBody.firstElementChild.style.bottom = '50%'
  }
  contentBody.insertBefore(es.html.container, contentBody.firstChild)
}

function showCssEditor (numEditors) {
  model.setProp('cssShow', true)
  if (numEditors === 2) {
    es.js.container.style.top = '0%';
    es.js.container.style.bottom = '66.66%';
    es.css.container.style.top = '33.33%';
    es.css.container.style.bottom = '33.33%';
    es.html.container.style.top = '66.66%';
    es.html.container.style.bottom = '0%';
  } else {
    if (contentBody.firstElementChild.id.includes('html')) {
      es.css.container.style.top = '0%'
      es.css.container.style.bottom = '50%'
      contentBody.firstElementChild.style.top = '50%'
      contentBody.firstElementChild.style.bottom = '0%'
    } else {
      es.css.container.style.top = '50%'
      es.css.container.style.bottom = '0%'
      contentBody.firstElementChild.style.top = '0%'
      contentBody.firstElementChild.style.bottom = '50%'
    }
  }
  contentBody.insertBefore(es.css.container, contentBody.firstChild)
}

function hideJsEditor (numEditors) {
  model.setProp('jsShow', false)
  contentBody.removeChild(es.js.container)
  if (numEditors === 3) {
    es.css.container.style.top = '0%';
    es.css.container.style.bottom = '50%';
    es.html.container.style.top = '50%';
    es.html.container.style.bottom = '0%';
  } else if (numEditors === 2) {
    contentBody.firstElementChild.style.top = '0%'
    contentBody.firstElementChild.style.bottom = '0%'
    if (contentBody.firstElementChild.id.includes('css')) {
      es.css.check.disabled = true
    } else {
      es.html.check.disabled = true
    }
  }
  es.js.check.checked = false
}

function hideHtmlEditor (numEditors) {
  model.setProp('htmlShow', false)
  contentBody.removeChild(es.html.container)
  if (numEditors === 3) {
    es.js.container.style.top = '0%';
    es.js.container.style.bottom = '50%';
    es.css.container.style.top = '50%';
    es.css.container.style.bottom = '0%';
  } else if (numEditors === 2) {
    contentBody.firstElementChild.style.top = '0%'
    contentBody.firstElementChild.style.bottom = '0%'
    if (contentBody.firstElementChild.id.includes('js')) {
      es.js.check.disabled = true
    } else {
      es.css.check.disabled = true
    }
  }
  es.html.check.checked = false
}

function hideCssEditor (numEditors) {
  model.setProp('cssShow', false)
  contentBody.removeChild(es.css.container)
  if (numEditors === 3) {
    es.js.container.style.top = '0%';
    es.js.container.style.bottom = '50%';
    es.html.container.style.top = '50%';
    es.html.container.style.bottom = '0%';
  } else if (numEditors === 2) {
    contentBody.firstElementChild.style.top = '0%'
    contentBody.firstElementChild.style.bottom = '0%'
    if (contentBody.firstElementChild.id.includes('html')) {
      es.html.check.disabled = true
    } else {
      es.js.check.disabled = true
    }
  }
  es.css.check.checked = false
}

var highlightCheck = document.getElementById('highlight')

// SAVE
function updateModel () {
  model.setProp('js', es.js.ace.session.getValue())
  model.setProp('html', es.html.ace.session.getValue())
  model.setProp('css', es.css.ace.session.getValue())
  model.setProp('highlightElement', highlightSelection)
}
function onModelChange (what) {
  if (what === 'js' || what === 'html' || what === 'css') {
    save(resetIframe)
  } else {
    save(null)
  }
}
function save (cb) {
  function sendRequest () {
    var oReq = new XMLHttpRequest()
    oReq.addEventListener('load', function () {
      if (oReq.status === 403) {
        setNewId(sendRequest)
        return
      } else if (oReq.status >= 400) {
        //TODO alert that it cannot be saved
        console.log('%ccannot save!', 'color: red')
      } else {
        console.log('%csaved!', 'color: red')
      }
      !!cb && cb()
    })
    oReq.open('POST', '/save/'+id)
    oReq.send(JSON.stringify(model))
  }

  if (id === '%ID%') {
    setNewId(sendRequest)
  } else {
    sendRequest()
  }
}

function setNewId (cb) {
  var nReq = new XMLHttpRequest()
  nReq.addEventListener('load', function() {
    id = JSON.parse(this.responseText).newId
    history.pushState(null, '', '/'+id);
    cb()
  })
  nReq.open('GET', '/new')
  nReq.send()
}

window.onload = function () {
  setResultSize()
  highlightCheck.checked = template.highlightElement
  var iframe = document.getElementsByTagName('iframe')[0]
}

// HEADER BUTTONS
var aboutButton = document.getElementById('aboutbutton')
var modalItems = document.getElementsByClassName('modali')
var modalOver = modalItems[0]
var sendFeedback = document.getElementById('feedbutton')
var feedbackArea = document.getElementById('feedarea')
var notification = document.getElementById('noti')
var aboutModalState = false
aboutButton.addEventListener('click', function () {
  aboutModalState = !aboutModalState;
  if (aboutModalState) {
    for (var i=0; i<modalItems.length; i++) {
      modalItems[i].style.display = 'block'
    }
  } else {
    for (var i=0; i<modalItems.length; i++) {
      modalItems[i].style.display = 'none'
    }
    noti.style.display = 'none'
  }
})
modalOver.addEventListener('click', function () {
  aboutModalState = false;
  for (var i=0; i<modalItems.length; i++) {
    modalItems[i].style.display = 'none'
  }
  noti.style.display = 'none'
})
sendFeedback.addEventListener('click', function () {
  noti.style.display = 'block'
  var fReq = new XMLHttpRequest()
  fReq.open('POST', '/feedback')
  fReq.send(feedbackArea.value)
  feedbackArea.value = ''
})

var newLink = document.getElementById('new')
newLink.addEventListener('click', (e) => {
  e.preventDefault()
  for (var i in es) {
    es[i].ace.setValue('')
  }
  setNewId(function () {})
})
var cloneLink = document.getElementById('clone')
cloneLink.addEventListener('click', (e) => {
  e.preventDefault()
  setNewId(function () {})
})
