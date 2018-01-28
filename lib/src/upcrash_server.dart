library server.server;

import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:googleapis_auth/auth_io.dart';
import 'package:firebase/firebase_io.dart';
import 'package:logging/logging.dart';
import 'package:server/src/server_api.dart';
import 'package:server/src/id.dart';
import 'package:server/src/response.dart';

class UpcrashServer {
  final Logger _log = new Logger('UpcrashServer');
  ServerApi _serApi;
  FirebaseClient _fbClient;

  UpcrashServer() {
    Logger.root
      ..level = Level.INFO
      ..onRecord.listen(print);
  }

  Future auth() async {
    final Map<String, String> envVars = Platform.environment;
    String privateKey;

    if (envVars['WEBSITEU'] != null) {
      privateKey = (await http.get(envVars['WEBSITEU'])).body;
    } else {
      throw new Exception('Could not Authenticate');
    }

    final String json = new JsonDecoder().convert(privateKey);
    final ServiceAccountCredentials accountCredentials =
        new ServiceAccountCredentials.fromJson(json);
    final List<String> scopes = [
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
    final http.Client client = new http.Client();
    final AccessCredentials credentials =
        await obtainAccessCredentialsViaServiceAccount(
            accountCredentials, scopes, client);
    _fbClient = new FirebaseClient(credentials.accessToken.data);
    _serApi = new ServerApi(_fbClient, 'https://upcrash-server.firebaseio.com/');
    client.close();
  }

  Future handle(HttpRequest req) async {
    _addCorsHeaders(req);

    List<String> uriParts = req.uri.pathSegments;
    Map<String, Function> apiMap = {
      'save': _serApi.save
    };

    Response resp = new Response();
    if (_isValidUri(uriParts)) {
      Id id = new Id(uriParts[1]);
      resp = await apiMap[uriParts[0]](id);
    } else {
      resp.statusCode = HttpStatus.NOT_FOUND;
      _log.warning('invalid uri');
    }
    if (resp.e != null) {
      _log.warning(resp.e.cause, resp.e);
    }
    _sendApiResponse(resp, req.response);
  }

  _addCorsHeaders(HttpRequest req) {
    req.response.headers.add('Access-Control-Allow-Origin', '*');
    req.response.headers.add('Access-Control-Allow-Methods', 'GET');
    req.response.headers.add('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
  }

  bool _isValidUri(List<String> uriParts) {
    List<String> apiMethods = ['save'];
    if (uriParts.length != 2) {
      return false;
    } else {
      if (!apiMethods.contains(uriParts[0])) {
        return false;
      }
    }
    return true;
  }

  Future _sendApiResponse(Response apiResponse, HttpResponse response) {
    response.statusCode = apiResponse.statusCode;
    response.reasonPhrase = apiResponse.reasonPhrase;
    apiResponse.headers
        .forEach((name, value) => response.headers.add(name, value));
    if (apiResponse.data != null) {
      response.add(apiResponse.data);
    }
    return response.close();
  }
}
