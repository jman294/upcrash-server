import 'dart:convert';

import 'package:test/test.dart';
import 'package:ads/src/response.dart';

void main() {
  Response res = new Response();
  group('Response', () {
    test('.write() should append data to list', () {
      expect(res.data, equals([]));
      res.write('H');
      expect(res.data, equals(new Utf8Encoder().convert('H')));
      res.write('i!');
      expect(res.data, equals(new Utf8Encoder().convert('Hi!')));
    });
    test('.add() should set data to list', () {
      res.add([1, 2]);
      expect(res.data, equals([1, 2]));
      res.add([3, 4]);
      expect(res.data, equals([3, 4]));
    });
  });
}