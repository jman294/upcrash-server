import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:firebase/firebase_io.dart';
import 'package:mailer/mailer.dart';
import 'package:server/src/id.dart';
import 'package:server/src/server_error.dart';
import 'package:server/src/server_errors.dart';
import 'package:server/src/response.dart';
import 'package:server/src/model.dart';

class ServerApi {
  FirebaseClient _db;
  String _fbHost;
  String _webHost;
  String _homePage;
  String _homePageRaw;
  final String _toReplace = '%FILLIN%';
  final String _toReplaceId = '%ID%';
  String _modelJson;

  ServerApi(this._db, this._fbHost, this._webHost);

  Future init() async {
    _modelJson = json.encode(new Model.default_());

    final String homePagePath = 'web/index.html';
    try {
      _homePageRaw = await new File(homePagePath).readAsString();
    } on FileSystemException catch (e) {
      throw e;
    }
    _homePage = _homePageRaw
        .replaceAll(_toReplace, _modelJson)
        .replaceAll('src="${_webHost}"', '');
  }

  Future<Response> home() async {
    Response res = new Response();
    res.headers['content-type'] = 'text/html';
    res.write(_homePage);
    return res;
  }

  Future<Response> save(HttpRequest req, Id id) async {
    bool exists = true;
    var results;
    try {
      results = await _db.get('$_fbHost/$id.json');
      exists = results != null && results['js'] != null;
    } on Exception catch (e) {
      return new Response.error(HttpStatus.BAD_REQUEST,
          new ServerException(ServerErrors.crashNotFound));
    }

    bool canEdit = false;
    if (exists) {
      if (req.session['id'] == id.toString()) {
        canEdit = true;
      } else {
        return new Response.error(
            HttpStatus.FORBIDDEN, new ServerException('preexisting crash'));
      }
    } else {
      req.session['id'] = id.toString();
      canEdit = true;
    }

    if (canEdit) {
      Map<dynamic, dynamic> payload;
      try {
        payload = json.decode(await utf8.decodeStream(req));
      } on FormatException {
        return new Response.error(HttpStatus.BAD_REQUEST,
            new ServerException(ServerErrors.invalidCrash));
      }
      if (Model.conformsToModel(payload)) {
        try {
          var _ = await _db.put('$_fbHost/$id.json', payload);
        } on Exception {
          return new Response.error(HttpStatus.BAD_REQUEST,
              new ServerException(ServerErrors.invalidCrash));
        }
        Response res = new Response();
        res.write(results.toString());
        return res;
      } else {
        return new Response.error(HttpStatus.BAD_REQUEST,
            new ServerException(ServerErrors.invalidCrashDoesNotConform));
      }
    }
  }

  Future<Response> load(Id id) async {
    final dynamic results = await _db.get('$_fbHost/$id.json');
    if (results == null) {
      //TODO add dedicated 404 error page that says sorry
      return new Response.error(HttpStatus.NOT_FOUND,
          new ServerException(ServerErrors.crashNotFound));
    } else {
      if (!Model.conformsToModel(results)) {
        // Rework payload to conform
        Model rebuiltPayload = Model.transferValidFields(results);
        Map<String, dynamic> payload = rebuiltPayload.toJson();
        try {
          var _ = await _db.put('$_fbHost/$id.json', payload);
        } on Exception {
          return new Response.error(
              HttpStatus.BAD_REQUEST,
              new ServerException(
                  'old crash was reworked and not able to be saved'));
        }
      }
      Response res = new Response();
      res.headers['content-type'] = 'text/html';
      res.write(_homePageRaw
          .replaceAll(_toReplace, json.encode(results))
          .replaceAll(_toReplaceId, id.toString()));
      return res;
    }
  }

  Future<Response> new_() async {
    Response res = new Response();
    res.headers['content-type'] = 'text/json';
    Id id = new Id.pronounceable();
    res.write(json.encode({'newId': id.toString()}));
    return res;
  }
}
