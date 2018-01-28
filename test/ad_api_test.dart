import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:firebase/firebase_io.dart';
import 'package:sqljocky/sqljocky.dart';
import 'package:test/test.dart';
import 'package:mockito/mockito.dart';
import 'package:ads/src/ad_api.dart';
import 'package:ads/src/id.dart';

class MockFirebaseClient implements FirebaseClient {
  bool isBad = false;
  String get (string) {
    if (isBad) {
      return null;
    } else {
      return 'farts';
    }
  }

  patch () {
    if (isBad) {
      return null;
    }
  }
}

void main() {
  AdApi adApi;
  MockFirebaseClient cPool;
  String host = 'farts';

  final bool GOOD_ID = false;
  final bool BAD_ID = true;

  setUp(() {
    cPool = new MockFirebaseClient();
    adApi = new AdApi(cPool, host);
  });

  group('AdApi', () {
    test('.image() should have correct response for good id', () async {
      expect((await adApi.image(new Id(1))).headers['content-type'], equals('image/png'));
      expect((await adApi.image(new Id(1))).statusCode, inInclusiveRange(200, 299));
    });
    test('.image() should have error response for bad id', () async {
      cPool.isBad = BAD_ID;
      adApi = new AdApi(cPool, host);
      expect((await adApi.image(new Id(-1))).statusCode, equals(404));
    });
    test('.image() should contain image on good id', () async {
      cPool.isBad = GOOD_ID;
      adApi = new AdApi(cPool, host);
      List<int> image = await new File('ad-images/1.png').readAsBytes();
      expect((await adApi.image(new Id(1))).data, equals(image));
    });

    test('.text() should have correct response for good id', () async {
      expect((await adApi.text(new Id(1))).headers['content-type'], equals('text/plain'));
      expect((await adApi.text(new Id(1))).statusCode, inInclusiveRange(200, 299));
    });
    test('.text() should have error response for bad id', () async {
      cPool.isBad = BAD_ID;
      adApi = new AdApi(cPool, host);
      expect((await adApi.text(new Id(-1))).statusCode, equals(404));
    });
    test('.text() should contain tagline on good id', () async {
      expect((await adApi.text(new Id(1))).data, equals(new Utf8Encoder().convert('farts')));
    });

    test('.click() should have correct response for good id', () async {
      // MockResults.list is a list of strings here, but in reality it is a type defined is sqljocky. That's why this test is weird
      // FIXME
      expect((await adApi.click(new Id(1))).headers['location'], equals('farts'));
      expect((await adApi.click(new Id(1))).statusCode, equals(302));
    });
    test('.click() should have error response for bad id', () async {
      cPool.isBad = BAD_ID;
      adApi = new AdApi(cPool, host);
      expect((await adApi.click(new Id(-1))).statusCode, equals(404));
    });
    test('.click() should contain no body on good id', () async {
      cPool.isBad = BAD_ID;
      // adApi = new AdApi(cPool);
      expect((await adApi.click(new Id(1))).data, equals([]));
    });
  });
}
