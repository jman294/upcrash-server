var highlightSelection = true
var saved = false
var model

NProgress.configure({ showSpinner: false })

var es = {
  js: {
    ace: ace.edit('jsedit'),
    typeTimer: -1,
    saveTimer: -1,
    container: document.getElementById('jscon'),
    check: document.getElementById('jscheck')
  },
  css: {
    ace: ace.edit('cssedit'),
    typeTimer: -1,
    saveTimer: -1,
    container: document.getElementById('csscon'),
    check: document.getElementById('csscheck')
  },
  html: {
    ace: ace.edit('htmledit'),
    typeTimer: -1,
    saveTimer: -1,
    container: document.getElementById('htmlcon'),
    check: document.getElementById('htmlcheck')
  }
}
model = new Model(template, onModelChange)

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

for (var e in es) {
  es[e].ace.setShowPrintMargin(false)
  es[e].ace.getSession().setUseWrapMode(true)
  es[e].ace.setTheme('ace/theme/monokai')
  es[e].ace.getSession().setUseWorker(model.lintCheck)

  es[e].ace.on('change', function () {
    clearTimeout(es[e].typeTimer)
    es[e].typeTimer = setTimeout(function () {
      updateModel()
    }, 1000)
  })
  es[e].ace.commands.addCommand({
    name: "showKeyboardShortcuts",
    bindKey: {win: "Ctrl-i", mac: "Command-i"},
    exec: function(editor) {
      fullScreenToggle()
    }
  })
}

function resetIframe () {
  var iframe = document.getElementsByTagName('iframe')[0]
  iframe.src = 'https://upcrash-serve.herokuapp.com/' + id
  resizeIframe(dims[0].value, dims[1].value)
  if (model.clearConsole) {
    console.clear()
  }
}

// RESIZE IFRAME
var result = document.getElementById('result')
var fullSize = document.getElementById('fullsize')
var resultPop = document.getElementById('resultpop')
var dims = document.getElementsByClassName('iframedim')
var WIDTH = 0
var HEIGHT = 1
function setResultSize () {
  var iframe = document.getElementsByTagName('iframe')[0]
  dims[WIDTH].value = iframe.offsetWidth
  dims[HEIGHT].value = iframe.offsetHeight
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
    if (parseInt(dims[WIDTH].value) > parseInt(dims[1].value)) {
      if (parseInt(dims[WIDTH].value) > rwidth) {
        iframe.style.transform = 'scale('+rwidth/dims[WIDTH].value+')'
      } else {
        iframe.style.transform = 'scale(1)'
      }
    } else {
      if (parseInt(dims[HEIGHT].value) > rheight) {
        iframe.style.transform = 'scale('+rheight/dims[HEIGHT].value+')'
      } else {
        iframe.style.transform = 'scale(1)'
      }
    }
    resizeIframe(dims[WIDTH].value, dims[HEIGHT].value)
  })
}
function resizeIframe (width, height) {
  width = parseInt(width)
  height = parseInt(height)
  var iframe = document.getElementsByTagName('iframe')[0]

  var rwidth = result.offsetWidth
  var rheight = result.offsetHeight
  iframe.style.height = height+'px'
  iframe.style.width = width+'px'
  if (width > height) {
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
  dims[WIDTH].value = iframe.offsetWidth
  dims[HEIGHT].value = iframe.offsetHeight
})

var fullScreen = document.getElementById('fullsizerly')
var isFullScreen = false
function fullScreenToggle () {
  isFullScreen = !isFullScreen
  if (isFullScreen) {
    fullScreen.src = 'images/downsize.png'
    result.style.left = '0'
    var iframe = document.getElementsByTagName('iframe')[0]
    iframe.style.transform = 'scale(1)'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    dims[WIDTH].value = iframe.offsetWidth
    dims[HEIGHT].value = iframe.offsetHeight
  } else {
    fullScreen.src = 'images/fullsize.png'
    result.style.left = '50%'
    var iframe = document.getElementsByTagName('iframe')[0]
    iframe.style.transform = 'scale(1)'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    dims[WIDTH].value = iframe.offsetWidth
    dims[HEIGHT].value = iframe.offsetHeight
  }
}
fullScreen.addEventListener('click', fullScreenToggle)

Mousetrap.bind(['command+i', 'ctrl+i'], function(e) {
  fullScreenToggle()
})
Mousetrap.bind(['command+1', 'ctrl+1'], function(e) {
  console.log('preset 1')
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


// SAVE
var saveNotifier = document.getElementById('savenoti')
function updateModel () {
  var inputJS = es.js.ace.session.getValue()
  if (model.willChange('js', inputJS)) {
    if (usingJSTranspiler) {
      var compiledJS = compileJS(inputJS, jsLang.selectedIndex)
      if (compiledJS === false) {
        model.setProp('uncompiledJS', inputJS)
      } else {
        model.setProp('js', compiledJS)
        model.setProp('uncompiledJS', inputJS)
      }
    } else {
      model.setProp('js', inputJS)
      model.setProp('uncompiledJS', '')
    }
  }
  var inputHtml = es.html.ace.session.getValue()
  if (model.willChange('html', inputHtml)) {
    if (usingHtmlTranspiler) {
      var compiledHtml = compileHtml(inputHtml, htmlLang.selectedIndex)
      if (compiledHtml === false) {
        model.setProp('uncompiledHTML', inputHtml)
      } else {
        model.setProp('html', compiledHtml)
        model.setProp('uncompiledHTML', inputHtml)
      }
    } else {
      model.setProp('html', inputHtml)
      model.setProp('uncompiledHTML', '')
    }
  }
  var inputCss = es.css.ace.session.getValue()
  if (model.willChange('css', inputCss)) {
    if (usingCssTranspiler) {
      var compiledCss = compileCss(inputCss, cssLang.selectedIndex)
      if (compiledCss === false) {
        model.setProp('uncompiledCSS', inputCss)
      } else {
        model.setProp('css', compiledCss)
        model.setProp('uncompiledCSS', inputCss)
      }
    } else {
      model.setProp('css', inputCss)
      model.setProp('uncompiledCSS', '')
    }
  }
  //model.setProp('html', es.html.ace.session.getValue())
  //model.setProp('css', es.css.ace.session.getValue())
}

function onModelChange (what) {
  saveNotifier.innerHTML = 'Unsaved!'
  if (what === 'js' || what === 'html' || what === 'css') {
    save(resetIframe)
  } else {
    save(null)
  }
}

function save (cb) {
  function sendRequest () {
    NProgress.start()
    var oReq = new XMLHttpRequest()
    oReq.addEventListener('load', function () {
      if (oReq.status === 403) {
        setNewId(sendRequest)
        return
      } else if (oReq.status >= 400) {
        saveNotifier.style.display = 'inline-block'
        saveNotifier.innerHTML = 'Cannot Save!'
        saveNotifier.classList.remove('good', 'ok')
        saveNotifier.classList.add('bad')
      } else {
        saveNotifier.style.display = 'inline-block'
        saveNotifier.innerHTML = 'Saved!'
        console.log('%csaved!', 'color: red')
        saveNotifier.classList.add('good')
        saveNotifier.classList.remove('bad', 'ok')
      }
    })
    oReq.addEventListener('error', function () {
      saveNotifier.style.display = 'inline-block'
      saveNotifier.innerHTML = 'Cannot Save!'
      saveNotifier.classList.remove('good', 'ok')
      saveNotifier.classList.add('bad')
    })
    oReq.addEventListener('loadend', function () {
      NProgress.done()
      !!cb && cb()
    })
    oReq.open('POST', '/save/'+id)
    oReq.send(JSON.stringify(model))
  }

  if (!navigator.onLine) {
    saveNotifier.style.display = 'inline-block'
    saveNotifier.innerHTML = 'Offline!'
    saveNotifier.classList.add('ok')
    saveNotifier.classList.remove('good', 'bad')
  } else if (id === '%ID%') {
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
}

// HEADER BUTTONS
var exportTemplate = '<!DOCTYPE html>\r\n<html>\r\n\t<head>\r\n\t\t<meta charset=\"UTF-8\">\r\n\t\t<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\r\n\t\t<link rel=\"stylesheet\" href=\"stylesheet.css\" type=\"text/css\">\r\n\t\t%STYLE%\r\n\t</head>\r\n\t<body>\r\n\t\t%HTML%\r\n\t\t%SCRIPT%\r\n\t</body>\r\n</html>'
var styleTemplate = '<style>%CSS%</style>'
var scriptTemplate = '<script>%JS%</script>'
var aboutButton = document.getElementById('aboutbutton')
var modalItems = document.getElementsByClassName('modali')
var modalOver = modalItems[0]
var htmlOutputArea = document.getElementById('exporthtmltextarea')
var cssOutputArea = document.getElementById('exportcsstextarea')
var jsOutputArea = document.getElementById('exportjstextarea')
var includeCssCheck = document.getElementById('includecss')
var includeJsCheck = document.getElementById('includejs')
var downloadButton = document.getElementById('download')
var aboutModalState = false
function fillInFields () {
  var filledInTemplate = exportTemplate.replace('%HTML%', model.html)
  if (includeJsCheck.checked) {
    filledInTemplate = filledInTemplate.replace('%SCRIPT%', scriptTemplate.replace('%JS%', model.js))
  } else {
    filledInTemplate = filledInTemplate.replace('%SCRIPT%', '')
  }
  if (includeCssCheck.checked) {
    filledInTemplate = filledInTemplate.replace('%STYLE%', styleTemplate.replace('%CSS%', model.css))
  } else {
    filledInTemplate = filledInTemplate.replace('%STYLE%', '')
  }
  htmlOutputArea.value = filledInTemplate
  cssOutputArea.value = model.css
  cssOutputArea.value = model.js
}
aboutButton.addEventListener('click', function () {
  aboutModalState = !aboutModalState;
  if (aboutModalState) {
    fillInFields()
    for (var i = 0; i < modalItems.length; i++) {
      modalItems[i].style.display = 'block'
    }
    if (modal.lastElementChild.nodeName == 'A') {
      modal.removeChild(modal.lastElementChild)
    }
  } else {
    for (var i=0; i<modalItems.length; i++) {
      modalItems[i].style.display = 'none'
    }
  }
})
modalOver.addEventListener('click', function () {
  aboutModalState = false;
  for (var i = 0; i < modalItems.length; i++) {
    modalItems[i].style.display = 'none'
  }
})
includeCssCheck.addEventListener('click', function () {
  fillInFields()
})
includeJsCheck.addEventListener('click', function () {
  fillInFields()
})
downloadButton.addEventListener('click', function () {
  var zip = new JSZip();
  zip.file("index.html", exportTemplate.replace('%SCRIPT%', '').replace('%STYLE%', '').replace('%HTML%', model.html));
  zip.file("index.js", model.js);
  zip.file("style.css", model.css);
  zip.generateAsync({type:"blob"})
  .then(function(content) {
    var blobUrl = URL.createObjectURL(content);
    var link = document.createElement("a");
    link.href = blobUrl;
    link.download = "website.zip";
    link.innerHTML = "Click here to download the file";
    if (modal.lastElementChild.nodeName == 'A') {
      modal.lastElementChild.href = blobUrl
    } else {
      modal.appendChild(link);
    }
  });
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

// SETTINGS
var JS = 0
var HTML = 1
var CSS = 2
var settings = document.getElementsByClassName('set')
var exits = document.getElementsByClassName('exit')
var conheads = document.getElementsByClassName('conhead')

for (var exit = 0; exit < exits.length; exit++) {
  exits[exit].addEventListener('click', function (e) {
    e.target.parentElement.style.display = 'none'
  })
}
for (var conhead = 0; conhead < conheads.length; conhead++) {
  conheads[conhead].addEventListener('click', function (e) {
    e.target.parentElement.firstElementChild.style.display = 'block'
  })
}

//// JS Settings
var loadType = document.getElementById('loadtype')
loadType.addEventListener('change', function (e) {
  model.setProp('loadType', e.target.selectedIndex)
})

var jsLang = document.getElementById('jslang')
var usingJSTranspiler = false
jsLang.addEventListener('change', function (e) {
  model.setProp('jsLang', e.target.selectedIndex)
  usingJSTranspiler = e.target.selectedIndex !== 0
  conheads[JS].innerHTML = e.target.value
})

//// HTML Settings
var htmlLang = document.getElementById('htmllang')
var usingHtmlTranspiler = false
htmlLang.addEventListener('change', function (e) {
  model.setProp('htmlLang', e.target.selectedIndex)
  usingHtmlTranspiler = e.target.selectedIndex !== 0
  conheads[HTML].innerHTML = e.target.value
})

var highlightCheck = document.getElementById('highlightel')
highlightCheck.addEventListener('change', function (e) {
  highlightElement = e.target.checked
  model.setProp('highlightElement', e.target.checked)
})

//// CSS Settings
var cssLang = document.getElementById('csslang')
var usingCssTranspiler
cssLang.addEventListener('change', function (e) {
  model.setProp('cssLang', e.target.selectedIndex)
  usingCssTranspiler = e.target.selectedIndex !== 0
  conheads[CSS].innerHTML = e.target.value
})

//// Other Settings
var lintCheck = document.getElementById('lintcheck')
lintCheck.addEventListener('change', function (e) {
  model.setProp('lintCheck', e.target.checked)
  for (var ed in es) {
    es[ed].ace.getSession().setUseWorker(e.target.checked)
  }
})

var consoleClearCheck = document.getElementById('consolecheck')
consoleClearCheck.addEventListener('change', function (e) {
  model.setProp('clearConsole', e.target.checked)
})

// COMPILERS
function compileJS (rawJS, mode) {
  switch (mode) {
    case 0:
      return rawJS
    case 1:
      return Babel.transform(rawJS, { presets: ['es2015'] }).code
    case 2:
      return Babel.transform(CoffeeScript.compile(rawJS), { presets: ['es2015'] }).code
  }
}

//function compileHtml (rawHtml, mode) {
  //return rawHtml
//}

//function compileCss (rawCss, mode) {
  //return rawCss
//}

// INITIALIZATION
loadType.selectedIndex = model.loadType
jsLang.selectedIndex = model.jsLang
usingJSTranspiler = jsLang.selectedIndex !== 0
conheads[JS].innerHTML = jsLang.options[model.jsLang].value

htmlLang.selectedIndex = model.htmlLang
conheads[HTML].innerHTML = htmlLang.options[model.htmlLang].value
highlightCheck.checked = model.highlightElement
highlightSelection = model.highlightElement;

cssLang.selectedIndex = model.cssLang
conheads[CSS].innerHTML = cssLang.options[model.cssLang].value
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


lintCheck.checked = model.lintCheck

if (usingJSTranspiler) {
  es.js.ace.setValue(model.uncompiledJS, -1)
} else {
  es.js.ace.setValue(model.js)
}
es.html.ace.setValue(model.html, -1)
es.css.ace.setValue(model.css, -1)
