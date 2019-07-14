import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';
import 'package:googleapis_auth/auth_io.dart';
import 'package:firebase/firebase_io.dart';
import 'package:logging/logging.dart';
import 'package:server/src/api.dart';
import 'package:server/src/server_errors.dart';
import 'package:server/src/server_error.dart';
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

  Future auth(String address, String port) async {
    final Map<String, String> envVars = Platform.environment;
    String privateKey;
    if (envVars['WEBSITEU'] != null) {
      privateKey = (await http.get(envVars['WEBSITEU'])).body;
    } else {
      throw new ServerException(ServerErrors.couldNotAuthenticate);
    }

    final ServiceAccountCredentials accountCredentials =
        new ServiceAccountCredentials.fromJson(privateKey);
    final List<String> scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/firebase.database'
    ];
    final http.Client client = new http.Client();
    final AccessCredentials credentials =
        await obtainAccessCredentialsViaServiceAccount(
            accountCredentials, scopes, client);
    _fbClient = new FirebaseClient(credentials.accessToken.data);
    String webHost = envVars['WEB_HOST'];
    if (envVars['FB_HOST'] == null || envVars['WEB_HOST'] == null) {
       throw new ServerException(ServerErrors.couldNotInitialize);
    } else if (envVars['WEB_HOST'] == 'development') {
      webHost = address + port;
    }
    _serApi = new ServerApi(
        _fbClient, envVars['FB_HOST'], webHost);
    try {
      await _serApi.init();
    } on FileSystemException {
      throw new ServerException(ServerErrors.couldNotAuthenticate);
    }
    client.close();
  }

  Future handle(HttpRequest req) async {
    List<String> uriParts = req.uri.pathSegments;

    Response resp = new Response();
    if (uriParts.length == 0) {
      resp = await _serApi.home();
    } else {
      switch (uriParts[0]) {
        case 'save':
          if (uriParts.length == 2 && _isValidId(uriParts[1])) {
            Id id = new Id(uriParts[1]);
            resp = await _serApi.save(req, id);
          } else {
            //TODO add dedicated 404 error page that says sorry
            resp = new Response.error(HttpStatus.NOT_FOUND,
                new ServerException(ServerErrors.invalidUri));
          }
          break;
        case 'new':
          resp = await _serApi.new_();
          break;
        default:
          if (_isValidId(uriParts[0])) {
            resp = await _serApi.load(new Id(uriParts[0]));
          } else {
            try {
              List<int> fileBytes = await new File('web'+req.uri.toFilePath()).readAsBytes();
              resp.add(fileBytes);
              resp.headers['Content-Type'] = lookupMimeType(req.uri.toFilePath());
            } on FileSystemException {
              //TODO add dedicated 404 error page that says sorry
              resp = new Response.error(HttpStatus.NOT_FOUND,
                  new ServerException(ServerErrors.invalidUri));
            } on Exception catch (e) {
              resp = new Response.error(HttpStatus.NOT_FOUND,
                  new ServerException(ServerErrors.invalidUri));
            }
          }
          break;
      }
    }

    if (resp.e != null) {
      _log.warning(resp.e.cause + ' ' + req.requestedUri.toString(), resp.e);
    }

    _sendApiResponse(resp, req.response);
  }

  _addCorsHeaders(HttpRequest req) {
    req.response.headers.add('Access-Control-Allow-Origin', '*');
    req.response.headers.add('Access-Control-Allow-Methods', 'GET');
    req.response.headers.add('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
  }

  bool _isValidId(String id) {
    return id.length == Id.LENGTH && id.indexOf('.') == -1;
  }

  Future _sendApiResponse(Response apiResponse, HttpResponse response) {
    return apiResponse.toHttpResponse(response).close();
  }
}
