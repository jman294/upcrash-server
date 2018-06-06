function Model (obj, onChange) {
  this.js = ""
  this.html = ""
  this.css = ""

  this.jsShow = true
  this.htmlShow = true
  this.cssShow = true

  this.highlightElement = false

  this.changed = onChange

  this.setProp = function (prop, newValue) {
    if (newValue != this[prop]) {
      this[prop] = newValue
      this.changed(prop)
    }
  }
  for (var prop in obj) this[prop] = obj[prop];
}

