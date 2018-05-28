library server.model;

class Model {
  String js;
  String html;
  String css;

  bool jsShow;
  bool htmlShow;
  bool cssShow;

  Model(this.js, this.html, this.css, this.jsShow, this.htmlShow, this.cssShow);

  factory Model.default_() {
    return new Model("", "", "", true, true, true);
  }

  Map toJson() {
    Map map = new Map();
    map["js"] = js;
    map["html"] = html;
    map["css"] = css;
    map["jsShow"] = jsShow;
    map["htmlShow"] = htmlShow;
    map["cssShow"] = cssShow;
    return map;
  }
}
