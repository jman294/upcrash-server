library server;

import 'dart:io';
import 'dart:async';
import 'package:server/src/upcrash_server.dart';

Future main(List<String> args) async {
  UpcrashServer upServer = new UpcrashServer();
  await upServer.auth();
  var server = await HttpServer.bind(args[0], int.parse(args[1]));
  server.listen(await upServer.handle);
}
