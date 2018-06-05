library server.api;

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
  String _host;
  String _homePage;
  String _homePageRaw;
  final String _toReplace = '%FILLIN%';
  final String _toReplaceId = '%ID%';
  String _modelJson;

  ServerApi(this._db, this._host);

  Future init() async {
    _modelJson = JSON.encode(new Model.default_());

    final String homePagePath = 'web/index.html';
    try {
      _homePageRaw = await new File(homePagePath).readAsString();
    } on FileSystemException catch (e) {
      throw e;
    }
    _homePage = _homePageRaw
        .replaceAll(_toReplace, _modelJson)
        .replaceAll('src="https://upcrash-serve.herokuapp.com/%ID%"', '');
  }

  Future<Response> home() async {
    Response res = new Response();
    res.headers['content-type'] = 'text/html';
    res.write(_homePage);
    return res;
  }

  Future<Response> save(HttpRequest req, Id id) async {
    var exists = true;
    try {
      var results = await _db.get('$_host/$id.json');
      exists = results != null && results['js'] != null;
    } on Exception {
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
        payload = JSON.decode(await UTF8.decodeStream(req));

        if (Model.conformsToModel(payload)) {
          try {
            var results = await _db.put('$_host/$id.json', payload);

            Response res = new Response();
            res.write(results.toString());
            return res;
          } on Exception {
            return new Response.error(HttpStatus.BAD_REQUEST,
                new ServerException(ServerErrors.invalidCrash));
          }
        } else {
          return new Response.error(HttpStatus.BAD_REQUEST,
              new ServerException(ServerErrors.invalidCrash));
        }
      } on FormatException {
        return new Response.error(HttpStatus.BAD_REQUEST,
            new ServerException(ServerErrors.invalidCrash));
      }
    }
  }

  Future<Response> load(Id id) async {
    final dynamic results = await _db.get('$_host/$id.json');
    if (results == null) {
      //TODO add dedicated 404 error page that says sorry
      return new Response.error(HttpStatus.NOT_FOUND,
          new ServerException(ServerErrors.crashNotFound));
    } else {
      if (Model.conformsToModel(results)) {
        Response res = new Response();
        res.headers['content-type'] = 'text/html';
        res.write(_homePageRaw
            .replaceAll(_toReplace, JSON.encode(results))
            .replaceAll(_toReplaceId, id.toString()));
        return res;
      } else {
        //TODO add dedicated error page that says sorry
        return new Response.error(HttpStatus.INTERNAL_SERVER_ERROR,
            new ServerException('it seems a crash was corrupted'));
      }
    }
  }

  Future<Response> new_() async {
    Response res = new Response();
    res.headers['Content-Type'] = 'text/json';
    Id id = new Id.pronounceable();
    res.write(new JsonEncoder().convert({'newId': id.toString()}));
    return res;
  }

  Future<Response> feedback(String payload, String passw) async {
    Response res = new Response();

    GmailSmtpOptions opts = new GmailSmtpOptions()
      ..username = 'upcrashfeedback@gmail.com'
      ..password = passw;

    SmtpTransport trans = new SmtpTransport(opts);
    Envelope envelope = new Envelope()
      ..from = 'jduplessis294@gmail.com'
      ..recipients.add('jduplessis294@gmail.com')
      ..subject = 'Upcrash Feedback'
      ..text = payload;

    await trans
        .send(envelope)
        .then((envelope) => print('Email sent!'))
        .catchError((e) => print('Error occurred: $e'));

    return res;
  }
}
