library server;

import 'dart:io';
import 'dart:async';
import 'package:server/src/handler.dart';
import 'package:server/src/server_error.dart';

Future main(List<String> args) async {
  UpcrashServer upServer = new UpcrashServer();
  try {
    await upServer.auth();
  } on ServerException catch(e) {
    //Fancy error handling here
    print("An error occurred in the initialization of the server");
    print(e);
    throw e;
  }
  var server = await HttpServer.bind(args[0], int.parse(args[1]));
  server.sessionTimeout = 36000;
  server.listen(await upServer.handle);
}
