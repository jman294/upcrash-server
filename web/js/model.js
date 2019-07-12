function Model (obj, onChange) {
  this.js = ""
  this.html = ""
  this.css = ""
  this.uncompiledJS = ""
  this.uncompiledHTML = ""
  this.uncompiledCSS = ""

  this.jsShow = true
  this.htmlShow = true
  this.cssShow = true

  this.loadType = 3
  this.jsLang = 0
  this.htmlLang = 0
  this.highlightElement = false
  this.cssLang = 0

  this.lintCheck = true

  this.clearConsole = true

  this.changed = onChange

  this.setProp = function (prop, newValue) {
    if (newValue !== this[prop]) {
      this[prop] = newValue
      this.changed(prop)
      return false
    } else {
      return true
    }
  }

  this.willChange = function (prop, newValue) {
    return newValue !== this[prop]
  }

  for (var prop in obj) this[prop] = obj[prop];
}
