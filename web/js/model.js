function Model (obj) {
  this.js = ""
  this.html = ""
  this.css = ""

  this.jsShow = true
  this.htmlShow = true
  this.cssShow = true

  this.highlightElement = false

  for (var prop in obj) this[prop] = obj[prop];
}
