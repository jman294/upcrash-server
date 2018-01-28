library server.error;

class ServerException implements Exception {
  String cause;
  ServerException(this.cause);
}
