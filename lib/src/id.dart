library ads.id;

class Id {
  String id;

  Id (this.id);
  Id.string (String id) {
    this.id = int.parse(id);
  }

  String toString () {
    return id.toString();
  }
}
