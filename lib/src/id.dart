library ads.id;

import 'dart:math';
import 'dart:convert';

class Id {
  String id;
  Random _rand = new Random();
  static const _alph = 'bcdfghjklmnpqrstvwxz';
  static const _vows = 'aeiou';

  Id (this.id);
  Id.pronounceable (len) {
    StringBuffer str = new StringBuffer();
    for (int i=0; i<len/2; i++) {
      str.write(_alph[_rand.nextInt(20)]);
      str.write(_vows[_rand.nextInt(5)]);
    }
    this.id = str.toString();
  }

  String toString () {
    return id.toString();
  }
}
