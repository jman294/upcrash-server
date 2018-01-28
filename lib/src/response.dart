library ads.response;

import 'dart:io';
import 'dart:convert';

import 'package:server/src/server_error.dart';

class Response {
  int _statusCode = HttpStatus.OK;
  Map<String, String> _headers = {};
  List<int> _data = [];
  String _reasonPhrase;
  ServerException _e;
  final Utf8Encoder encoder = new Utf8Encoder();

  Map<String, String> get headers => _headers;
  int get statusCode => _statusCode;
  List<int> get data => _data;
  String get reasonPhrase => _reasonPhrase;
  ServerException get e => _e;

  void set statusCode(int statusCode) {
    _statusCode = statusCode;
  }
  void set reasonPhrase(String reasonPhrase) {
    _reasonPhrase = reasonPhrase;
  }
  void set e(ServerException e) {
    _e = e;
  }

  void add(List<int> data) {
    _data = data;
  }
  void write(String str) {
    _data.insertAll(_data.length, encoder.convert(str));
  }

  Response();
  factory Response.error(int statusCode, ServerException e) {
    Response res = new Response();
    res.e = e;
    res.statusCode = statusCode;
    res.reasonPhrase = e.cause;
    return res;
  }
}
