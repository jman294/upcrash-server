library server.server;

import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mime_type/mime_type.dart';
import 'package:googleapis_auth/auth_io.dart';
import 'package:firebase/firebase_io.dart';
import 'package:logging/logging.dart';
import 'package:server/src/server_api.dart';
import 'package:server/src/server_errors.dart';
import 'package:server/src/server_error.dart';
import 'package:server/src/id.dart';
import 'package:server/src/response.dart';

class UpcrashServer {
  final Logger _log = new Logger('UpcrashServer');
  ServerApi _serApi;
  FirebaseClient _fbClient;
  String _templateString;

  UpcrashServer() {
    Logger.root
      ..level = Level.INFO
      ..onRecord.listen(print);
  }

  Future auth() async {
    final rawTemplateString = await new File('web/index.html').readAsString();
    final String blank =
        "{html: '',css: '',js: '',htmlShow: true,jsShow: true,cssShow: true,highlightElement: true}";
    _templateString = rawTemplateString.replaceAll('%FILLIN%', blank);
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
    _serApi = new ServerApi(
        _fbClient, 'https://upcrash-server.firebaseio.com/', rawTemplateString);
    client.close();
  }

  Future handle(HttpRequest req) async {
    List<String> uriParts = req.uri.pathSegments;

    Response resp = new Response();
    if (uriParts.length == 0) {
      resp.headers['content-type'] = 'text/html';
      resp.write(_templateString);
    } else {
      switch (uriParts[0]) {
        case 'feedback':
          resp = await _serApi.feedback(await UTF8.decodeStream(req), Platform.environment['PASSW']);
          break;
        case 'save':
          if (uriParts.length == 2 && _isValidId(uriParts[1])) {
            Id id = new Id(uriParts[1]);
            Map<dynamic, dynamic> payload;
            try {
              payload = JSON.decode(await UTF8.decodeStream(req));
              resp = await _serApi.save(id, payload);
            } on FormatException {
              resp.statusCode = HttpStatus.BAD_REQUEST;
              resp.reasonPhrase = ServerErrors.invalidCrash;
              _log.warning('invalid crash attempted to be saved');
            }
          } else {
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
              resp.headers['Content-Type'] = mime(req.uri.toFilePath());
            } on FileSystemException {
              resp = new Response.error(HttpStatus.NOT_FOUND,
                  new ServerException(ServerErrors.invalidUri));
            }
          }
          break;
      }
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

  bool _isValidId(String id) {
    return id.length == Id.LENGTH && id.indexOf('.') == -1;
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
