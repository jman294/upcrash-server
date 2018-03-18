library server.api;

import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:firebase/firebase_io.dart';
import 'package:server/src/id.dart';
import 'package:server/src/server_error.dart';
import 'package:server/src/server_errors.dart';
import 'package:server/src/response.dart';

class ServerApi {
  FirebaseClient _db;
  String _host;
  String _template;
  ServerApi(this._db, this._host, this._template);

  Future<Response> save(Id id, Map<dynamic, dynamic> payload) async {
    //final String results =
    //await _db.get('$_host/$id.json');
    //if (results == null) {
    //return new Response.error(
    //HttpStatus.NOT_FOUND, new ServerException(ServerErrors.crashNotFound));
    //} else {
    try {
      var results = await _db.put('$_host/$id.json', payload);
      Response res = new Response();
      res.write(results.toString());
      return res;
    } on Exception {
      Response res = Response.error(
          HttpStatus.BAD_REQUEST, new ServerException('Authorization error'));
      return res;
    }
    //}
  }

  Future<Response> load(Id id) async {
    final dynamic results = await _db.get('$_host/$id.json');
    if (results == null) {
      return new Response.error(HttpStatus.NOT_FOUND,
          new ServerException(ServerErrors.crashNotFound));
    } else {
      Response res = new Response();
      res.headers['content-type'] = 'text/html';
      res.write(_template.replaceAll('%FILLIN%', JSON.encode(results)));
      return res;
    }
  }

  Future<Response> new_() async {
    Response res = new Response();
    res.headers['Content-Type'] = 'text/json';
    Id id = new Id.pronounceable();
    res.write(new JsonEncoder().convert({'newId': id.toString()}));
    return res;
  }
}
