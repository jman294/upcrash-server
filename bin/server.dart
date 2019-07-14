import 'dart:io';
import 'dart:async';
import 'package:server/src/handler.dart';
import 'package:server/src/server_error.dart';

Future main(List<String> args) async {
  UpcrashServer upServer = new UpcrashServer();

  String address = args[0];
  String port = args[1];

  try {
    await upServer.auth(address, port);
  } on ServerException catch(e) {
    print("An error occurred in the initialization of the server");
    print(e);
    throw e;
  }
  var server = await HttpServer.bind(address, int.parse(port));
  server.sessionTimeout = 36000;
  server.listen(await upServer.handle);
}
