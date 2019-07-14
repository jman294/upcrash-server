library server.errors;

class ServerErrors {
  static final String crashNotFound = 'crash not found';
  static final String invalidCrash = 'invalid crash';
  static final String invalidCrashDoesNotConform =
      'invalid crash does not fit model';
  static final String invalidUri = 'invalid uri';
  static final String couldNotAuthenticate = 'could not authenticate';
  static final String couldNotInitialize = 'could not initialize due to bad configuration';
}
