library server.model;

class Model {
  String js;
  String html;
  String css;

  bool jsShow;
  bool htmlShow;
  bool cssShow;
  bool highlightElement;

  Model(this.js, this.html, this.css, this.jsShow, this.htmlShow, this.cssShow,
        this.highlightElement);

  factory Model.default_() {
    return new Model("", "", "", true, true, true, false);
  }

  Map toJson() {
    Map map = new Map();
    map["js"] = js;
    map["html"] = html;
    map["css"] = css;
    map["jsShow"] = jsShow;
    map["htmlShow"] = htmlShow;
    map["cssShow"] = cssShow;
    map["highlightElement"] = highlightElement;
    return map;
  }
}
