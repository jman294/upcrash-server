library server.api;

import 'dart:io';
import 'dart:async';

import 'package:firebase/firebase_io.dart';
import 'package:server/src/id.dart';
import 'package:server/src/server_error.dart';
import 'package:server/src/server_errors.dart';
import 'package:server/src/response.dart';

class ServerApi {
  FirebaseClient _db;
  String _host;
  ServerApi(this._db, this._host);

  Future<Response> save(Id id) async {
    final String results =
        await _db.get('$_host/$id.json');
    if (results == null) {
      return new Response.error(
          HttpStatus.NOT_FOUND, new ServerException(ServerErrors.crashNotFound));
    } else {
      Response res = new Response();
      res.write(results.toString());
      return res;
    }
  }
}
