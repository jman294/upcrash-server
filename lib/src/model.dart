library server.model;

class Model {
  String js;
  String html;
  String css;
  String uncompiledJS;
  String uncompiledHTML;
  String uncompiledCSS;

  bool jsShow;
  bool htmlShow;
  bool cssShow;
  bool highlightElement;

  int loadType;
  int jsLang;
  int htmlLang;
  int cssLang;

  bool lintCheck;
  
  bool clearConsole;

  Model(
      this.js,
      this.html,
      this.css,
      this.uncompiledJS,
      this.uncompiledHTML,
      this.uncompiledCSS,
      this.jsShow,
      this.htmlShow,
      this.cssShow,
      this.highlightElement,
      this.loadType,
      this.jsLang,
      this.htmlLang,
      this.cssLang,
      this.lintCheck,
      this.clearConsole);

  factory Model.default_() {
    return new Model("", "", "", "", "", "", true, true, true, false, 3, 0, 0, 0, true, true);
  }

  static conformsToModel(Map json) {
    //TODO make this expandable with constraint system
    bool hasFields =
      json['js'] != null &&
      json['html'] != null &&
      json['css'] != null &&
      json['uncompiledJS'] != null &&
      json['uncompiledHTML'] != null &&
      json['uncompiledCSS'] != null &&
      json['jsShow'] != null &&
      json['htmlShow'] != null &&
      json['cssShow'] != null &&
      json['highlightElement'] != null &&
      json['loadType'] != null &&
      json['jsLang'] != null &&
      json['htmlLang'] != null &&
      json['cssLang'] != null &&
      json['lintCheck'] != null &&
      json['clearConsole'] != null;
    if (!hasFields) return false;
    bool fieldTypesCorrect =
      json['js'] is String &&
      json['html'] is String &&
      json['css'] is String &&
      json['uncompiledJS'] is String &&
      json['uncompiledHTML'] is String &&
      json['uncompiledCSS'] is String &&
      json['jsShow'] is bool &&
      json['htmlShow'] is bool &&
      json['cssShow'] is bool &&
      json['highlightElement'] is bool &&
      json['loadType'] is int &&
      json['jsLang'] is int &&
      json['htmlLang'] is int &&
      json['cssLang'] is int &&
      json['lintCheck'] is bool &&
      json['clearConsole'] is bool;
    if (!fieldTypesCorrect) return false;
    bool fieldValuesCorrect =
      json['loadType'] >= 0 &&
      json['loadType'] <= 3 &&
      json['jsLang'] >= 0 &&
      json['jsLang'] <= 4 &&
      json['htmlLang'] >= 0 &&
      json['htmlLang'] <= 2 &&
      json['cssLang'] >= 0 &&
      json['cssLang'] <= 3;
    if (!fieldValuesCorrect) return false;

    return true;
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
