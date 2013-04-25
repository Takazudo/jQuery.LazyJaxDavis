(function() {

  (function($, window, document) {
    var ns, router, wait;
    ns = $.LazyJaxDavisNs;
    wait = ns.wait;
    router = null;
    QUnit.testDone(function() {
      if (router != null) {
        router.stop();
      }
      return router = null;
    });
    test('util isToId', function() {
      var path;
      path = '#foobar';
      ok(ns.isToId(path), path);
      path = 'foobar';
      ok(!(ns.isToId(path)), path);
      path = '';
      return ok(!(ns.isToId(path)), path);
    });
    test('util tryParseAnotherPageAnchor', function() {
      var path, res;
      path = '/somewhere/foo.html#bar';
      res = ns.tryParseAnotherPageAnchor(path);
      equal(res.path, '/somewhere/foo.html', "" + path + " - path: " + res.path);
      equal(res.hash, '#bar', "" + path + " - hash: " + res.hash);
      path = '#foobar';
      res = ns.tryParseAnotherPageAnchor(path);
      equal(res, false, "" + path + " - false");
      path = 'foobar';
      res = ns.tryParseAnotherPageAnchor(path);
      return equal(res, false, "" + path + " - false");
    });
    test('util filterStr title parse', function() {
      var expr, html, runTest, shouldbe;
      expr = ns.Router.prototype.options.expr.title;
      runTest = function(html, shouldbe) {
        return equal(ns.filterStr(html, expr), shouldbe, html);
      };
      html = "<title>foobar</title>";
      shouldbe = 'foobar';
      runTest(html, shouldbe);
      html = "<title></title>";
      shouldbe = null;
      runTest(html, shouldbe);
      html = "nothing here";
      shouldbe = null;
      runTest(html, shouldbe);
      html = "<title attr=\"mewmew\">foobar</title>";
      shouldbe = "foobar";
      runTest(html, shouldbe);
      html = "<title attr=\"mewmew\">\n  foobar  \n  	</title>";
      shouldbe = "foobar";
      return runTest(html, shouldbe);
    });
    test('util filterStr content parse', function() {
      var expr, html, runTest, shouldbe;
      expr = ns.Router.prototype.options.expr.content;
      runTest = function(html, shouldbe) {
        return equal(ns.filterStr(html, expr), shouldbe, html);
      };
      html = "<!-- LazyJaxDavis start -->\nfoobar\nmewmew moomoo\n\nmooomoo\n<!-- LazyJaxDavis end -->";
      shouldbe = "foobar\nmewmew moomoo\n\nmooomoo";
      runTest(html, shouldbe);
      html = "<!-- LazyJaxDavis start -->";
      shouldbe = null;
      runTest(html, shouldbe);
      html = "<!-- LazyJaxDavis end -->";
      shouldbe = null;
      runTest(html, shouldbe);
      html = "nothing here";
      shouldbe = null;
      runTest(html, shouldbe);
      html = "xxx<!-- LazyJaxDavis start -->zzz\nfoobar\nooo<!-- LazyJaxDavis end -->zzz";
      shouldbe = "zzz\nfoobar\nooo";
      runTest(html, shouldbe);
      html = "mewmew\n<!-- LazyJaxDavis start -->\nfoobar\n\n\n\nfoobar\nfoobar\n<!-- LazyJaxDavis end -->\nmewmew";
      shouldbe = "foobar\n\n\n\nfoobar\nfoobar";
      return runTest(html, shouldbe);
    });
    test('util filterStr captureAll', function() {
      var html, res, type;
      html = "<img src=\"foobar.gif\"> <img src=\"moomoo.png\">\n<img src=\"mewmew.gif\">";
      res = ns.filterStr(html, /src="([^"]+)"/gi, true);
      type = $.type(res);
      equal(type, 'array', "result type: " + type);
      equal(res.length, 3, "resutl length: " + res.length);
      equal(res[0], 'foobar.gif', "result[0]: " + res[0]);
      equal(res[1], 'moomoo.png', "result[1]: " + res[1]);
      equal(res[2], 'mewmew.gif', "result[2]: " + res[2]);
      html = "asdfasdf";
      res = ns.filterStr(html, /src="([^"]+)"/gi, true);
      type = $.type(res);
      equal(type, 'array', "result type: " + type);
      return equal(res.length, 0, "resutl length: " + res.length);
    });
    asyncTest('ajax fetchPage', function() {
      var check;
      expect(1);
      check = function(text) {
        return equal($.trim(text), 'DUMMY', "fetched text: " + text);
      };
      return (ns.fetchPage('dummy.html')).then(function(text) {
        return check(text);
      }, function() {
        return ok(false, 'ajax failed');
      }).always(function() {
        return start();
      });
    });
    asyncTest('ajax fetchPage call abort', function() {
      var res;
      expect(2);
      res = ns.fetchPage('dummy.html?12345');
      res.then(function() {
        return ok(false, 'ajax successed unexpectedly');
      }, function(aborted) {
        ok(true, 'ajax failed');
        return ok(aborted, 'was aborted');
      }).always(function() {
        return start();
      });
      return res.abort();
    });
    asyncTest('ajax fetchPage new requests let the active request abort', function() {
      expect(5);
      (ns.fetchPage('dummy.html?asdfasdf')).then(function() {
        return ok(false, '1st request: ajax successed unexpectedly');
      }, function(aborted) {
        ok(true, '1st request: ajax failed');
        return ok(aborted, '1st request: was aborted');
      });
      (ns.fetchPage('dummy.html?xyzxyz')).then(function() {
        return ok(false, '2nd request: ajax successed unexpectedly');
      }, function(aborted) {
        ok(true, '2nd request: ajax failed');
        return ok(aborted, '2nd request: was aborted');
      });
      return (ns.fetchPage('dummy.html?xyzxyz')).then(function() {
        return ok(true, '3rd request: ajax successed');
      }, function(aborted) {
        return ok(false, '3rd request: ajax failed');
      }).always(function() {
        return start();
      });
    });
    asyncTest('Event - bind/trigger', function() {
      var eventer;
      expect(1);
      eventer = new ns.Event;
      eventer.bind('foo', function() {
        ok(true, 'foo event triggered');
        return start();
      });
      return eventer.trigger('foo');
    });
    asyncTest('Event - bind with args', function() {
      var eventer;
      expect(4);
      eventer = new ns.Event;
      eventer.bind('foo', function(arg1, arg2, arg3) {
        ok(true, 'foo event triggered');
        equal(arg1, 1, 'arg was passed');
        equal(arg2, 2, 'arg was passed');
        equal(arg3, 3, 'arg was passed');
        return start();
      });
      return eventer.trigger('foo', 1, 2, 3);
    });
    asyncTest('Event - unbind', function() {
      var eventer;
      expect(1);
      eventer = new ns.Event;
      eventer.bind('foo', function() {
        return ok(false, 'event was fired');
      });
      eventer.unbind('foo');
      eventer.trigger('foo');
      return wait(0).done(function() {
        ok(true, 'event was not fired');
        return start();
      });
    });
    asyncTest('Event - one', function() {
      var eventer;
      expect(1);
      eventer = new ns.Event;
      eventer.one('foo', function() {
        return ok(true, 'event was fired');
      });
      eventer.trigger('foo');
      eventer.trigger('foo');
      eventer.trigger('foo');
      return wait(0).done(function() {
        return start();
      });
    });
    test('HistoryLogger', function() {
      var i, logger, _i;
      logger = new ns.HistoryLogger;
      equal(logger.size(), 1, 'first url will be added automatically');
      for (i = _i = 1; _i <= 10; i = ++_i) {
        logger.push('foobar');
      }
      logger.push('moomoo');
      equal(logger.size(), 12, logger._items);
      return equal(logger.last(), 'moomoo');
    });
    test('HistoryLogger isToSamePageRequst', function() {
      var i, logger, _i;
      logger = new ns.HistoryLogger;
      for (i = _i = 1; _i <= 10; i = ++_i) {
        logger.push("foobar" + i);
      }
      return ok(logger.isToSamePageRequst("foobar10"), 'was same request');
    });
    test('Page instance creation', function() {
      var config, options, page, request, routed;
      request = {
        path: 'foobar'
      };
      config = null;
      routed = false;
      router = null;
      options = null;
      page = new ns.Page(request, config, routed, router, options);
      ok(page, 'instance creation successed');
      return equal(page.path, 'foobar', "path is " + page.path);
    });
    asyncTest('Page fetch', function() {
      var config, options, page, request, routed;
      expect(2);
      request = {
        path: 'dummy.html'
      };
      config = null;
      routed = false;
      router = null;
      options = null;
      page = new ns.Page(request, config, routed, router, options);
      return page.fetch().done(function() {
        ok(true, 'ajax completed');
        return equal($.trim(page._text), 'DUMMY', 'fetched text was what I expected.');
      }).always(function() {
        return start();
      });
    });
    asyncTest('Page fetch events abort', function() {
      var config, fetchDefer, options, page, request, routed;
      expect(1);
      request = {
        path: 'dummy.html'
      };
      config = null;
      routed = false;
      router = null;
      options = null;
      page = new ns.Page(request, config, routed, router, options);
      fetchDefer = page.fetch();
      fetchDefer.then(function() {
        return ok(false, '1st fetch successed');
      }, function(error) {
        return ok(error.aborted, '1st fetch aborted');
      }).always(function() {
        return start();
      });
      return fetchDefer.abort();
    });
    asyncTest('Page fetch events fail', function() {
      var config, options, page, request, routed;
      expect(2);
      request = {
        path: 'nothinghere.html'
      };
      config = null;
      routed = false;
      router = null;
      options = null;
      page = new ns.Page(request, config, routed, router, options);
      return page.fetch().then(function() {
        return ok(false, 'ajax failed');
      }, function(error) {
        ok(true, 'ajax failed');
        return ok(!error.aborted, 'ajax was not aborted');
      }).always(function() {
        return start();
      });
    });
    asyncTest('Page rip', function() {
      var config, options, page, request, routed;
      expect(3);
      request = {
        path: 'dummy2.html'
      };
      config = null;
      routed = false;
      router = null;
      options = {
        expr: {
          title: /<title[^>]*>([^<]*)<\/title>/,
          content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
        }
      };
      page = new ns.Page(request, config, routed, router, options);
      return page.fetch().done(function() {
        var expected;
        expected = "foobar\nfoobar\n<title>changed title</title>\nfoobar\n<!-- LazyJaxDavis start -->\ncontent here\ncontent here\ncontent here\ncontent here\n<!-- LazyJaxDavis end -->\nbooboo";
        equal($.trim(page.rip()), expected, expected);
        expected = "changed title";
        equal(page.rip('title'), expected, expected);
        expected = "content here\ncontent here\ncontent here\ncontent here";
        return equal(page.rip('content'), expected, expected);
      }).always(function() {
        return start();
      });
    });
    test('Page rip fail', function() {
      var config, options, page, request, routed;
      expect(2);
      request = {
        path: 'dummy2.html'
      };
      config = null;
      routed = false;
      router = null;
      options = {
        expr: null
      };
      page = new ns.Page(request, config, routed, router, options);
      equal(page.rip('thisKeyDoesNotExist'), null, 'requested key was not defined');
      return equal(page.rip(), null, 'notfetched yet so rip returns null');
    });
    test('Router new', function() {
      var r1;
      r1 = new ns.Router($.noop);
      ok(r1 instanceof ns.Router, 'create instance with new');
      return ok(r1.history instanceof ns.HistoryLogger, 'history logger was attached');
    });
    asyncTest('Page rip captureAll', 4, function() {
      var config, options, page, request, routed;
      request = {
        path: 'dummy4.html'
      };
      config = null;
      routed = false;
      router = null;
      options = {
        updatetitle: false,
        expr: {
          title: /<title[^>]*>([^<]*)<\/title>/,
          content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/,
          imgsrc: /src="([^"]+)"/gi
        }
      };
      page = new ns.Page(request, config, routed, router, options);
      return page.fetch().done(function() {
        var res, type;
        res = page.ripAll('imgsrc');
        type = $.type(res);
        equal(type, 'array', "ripped reuslt type: " + type);
        equal(res[0], 'foobar.gif', "result[0]: " + res[0]);
        equal(res[1], 'moomoo.png', "result[1]: " + res[1]);
        return equal(res[2], 'mewmew.gif', "result[2]: " + res[2]);
      }).always(function() {
        return start();
      });
    });
    asyncTest('Page rip captureAll matched nothing', 2, function() {
      var config, options, page, request, routed;
      request = {
        path: 'dummy5.html'
      };
      config = null;
      routed = false;
      router = null;
      options = {
        updatetitle: false,
        expr: {
          title: /<title[^>]*>([^<]*)<\/title>/,
          content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/,
          imgsrc: /src="([^"]+)"/gi
        }
      };
      page = new ns.Page(request, config, routed, router, options);
      return page.fetch().done(function() {
        var res, type;
        res = page.ripAll('imgsrc');
        type = $.type(res);
        equal(type, 'array', "ripped reuslt type: " + type);
        return equal(res.length, 0, "result's length: " + res.length);
      }).always(function() {
        return start();
      });
    });
    test('Router initializer', function() {
      var exported, r;
      exported = null;
      r = new ns.Router(function(arg) {
        return exported = arg;
      });
      return equal(r, exported, 'router passes router instance to initializer');
    });
    test('Router initializer option', function() {
      var origOptVal, r;
      origOptVal = true;
      r = new ns.Router(function(router) {
        return router.option({
          firereadyonstart: false
        });
      });
      return equal(r.options.firereadyonstart, false, '.option overrided default value');
    });
    test('Router initializer route', function() {
      var r;
      r = new ns.Router(function(router) {
        return router.route([
          {
            path: 'foobar',
            pageready: $.noop
          }
        ]);
      });
      return ok(r.pages, '.route worked w/o error');
    });
    test('Router initializer routeDavis', function() {
      var r;
      r = new ns.Router(function(router) {
        return router.routeDavis(function() {
          return this.get('foobar', function() {});
        });
      });
      return ok(r.davis, '.routeDavis worked w/o error');
    });
    test('Router event', function() {
      var r;
      expect(1);
      r = new ns.Router(function(router) {
        return router.bind('foo', function() {
          return ok(true, 'event was successed to trigger');
        });
      });
      return r.trigger('foo');
    });
    test('Router _findWhosePathMatches', function() {
      var page1, page2, page3, page4, pages, r;
      page1 = {
        path: 'foo'
      };
      page2 = {
        path: 'bar'
      };
      page3 = {
        path: 'mew'
      };
      page4 = {
        path: 'moo'
      };
      pages = [];
      pages.push(page1);
      pages.push(page2);
      pages.push(page3);
      pages.push(page4);
      r = new ns.Router(function(router) {
        return router.route(pages);
      });
      equal(r._findWhosePathMatches('page', 'foo'), page1, 'page was found');
      equal(r._findWhosePathMatches('page', 'bar'), page2, 'page was found');
      equal(r._findWhosePathMatches('page', 'mew'), page3, 'page was found');
      return equal(r._findWhosePathMatches('page', 'moo'), page4, 'page was found');
    });
    test('Router _findWhosePathMatches ignore getvals via page config', function() {
      var page1, page2, page3, page4, pages, r;
      page1 = {
        path: 'foo',
        ignoregetvals: true
      };
      page2 = {
        path: 'bar',
        ignoregetvals: false
      };
      page3 = {
        path: 'mew',
        ignoregetvals: true
      };
      page4 = {
        path: 'moo'
      };
      pages = [];
      pages.push(page1);
      pages.push(page2);
      pages.push(page3);
      pages.push(page4);
      r = new ns.Router(function(router) {
        return router.route(pages);
      });
      equal(r._findWhosePathMatches('page', 'foo?xxx=yyy'), page1, 'get values were ignored');
      equal(r._findWhosePathMatches('page', 'bar?xxx=yyy'), null, 'get values were not ignored');
      equal(r._findWhosePathMatches('page', 'mew?xxx=yyy'), page3, 'get values were ignored');
      return equal(r._findWhosePathMatches('page', 'moo?xxx=yyy'), null, 'get values were not ignored');
    });
    test('Router _findWhosePathMatches ignore getvals via Router config', function() {
      var page1, page2, page3, page4, pages, r;
      page1 = {
        path: 'foo'
      };
      page2 = {
        path: 'bar'
      };
      page3 = {
        path: 'mew'
      };
      page4 = {
        path: 'moo'
      };
      pages = [];
      pages.push(page1);
      pages.push(page2);
      pages.push(page3);
      pages.push(page4);
      r = new ns.Router(function(router) {
        router.option({
          ignoregetvals: true
        });
        return router.route(pages);
      });
      equal(r._findWhosePathMatches('page', 'foo?xxx=yyy'), page1, 'get values were ignored');
      equal(r._findWhosePathMatches('page', 'bar?xxx=yyy'), page2, 'get values were ignored');
      equal(r._findWhosePathMatches('page', 'mew?xxx=yyy'), page3, 'get values were ignored');
      return equal(r._findWhosePathMatches('page', 'moo?xxx=yyy'), page4, 'get values were ignored');
    });
    test('Router _findWhosePathMatches handleMulti', function() {
      var page1, page2, page3, page4, pages, r, res;
      page1 = {
        path: 'foo'
      };
      page2 = {
        path: 'bar'
      };
      page3 = {
        path: 'foo'
      };
      page4 = {
        path: 'moo'
      };
      pages = [];
      pages.push(page1);
      pages.push(page2);
      pages.push(page3);
      pages.push(page4);
      r = new ns.Router(function(router) {
        return router.route(pages);
      });
      res = r._findWhosePathMatches('page', 'foo', true);
      equal(res.length, 2, 'found 2 pages as array');
      equal(res[0], page1, 'matched page was correct');
      equal(res[1], page3, 'matched page was correct');
      equal((r._findWhosePathMatches('page', 'bar', true))[0], page2, 'found 1 page as array');
      return equal((r._findWhosePathMatches('page', 'moo', true))[0], page4, 'found 1 page as array');
    });
    test('Router _findWhosePathMatches pathexpr', function() {
      var page1, page2, page3, page4, pages, r;
      page1 = {
        path: /foo/
      };
      page2 = {
        path: /bar/
      };
      page3 = {
        path: /mew/
      };
      page4 = {
        path: /moo/
      };
      pages = [];
      pages.push(page1);
      pages.push(page2);
      pages.push(page3);
      pages.push(page4);
      r = new ns.Router(function(router) {
        return router.route(pages);
      });
      equal(r._findWhosePathMatches('page', 'foo'), page1, 'page was found');
      equal(r._findWhosePathMatches('page', 'bar'), page2, 'page was found');
      equal(r._findWhosePathMatches('page', 'mew'), page3, 'page was found');
      return equal(r._findWhosePathMatches('page', 'moo'), page4, 'page was found');
    });
    test('Router _createPage', function() {
      var config, hash, page, r, request, routed;
      request = null;
      config = {
        path: 'foo'
      };
      routed = true;
      hash = null;
      r = new ns.Router($.noop);
      page = r._createPage(request, config, routed, hash);
      return ok(page instanceof ns.Page, 'create instance');
    });
    test('Router _createPage anchorhandler via route option', function() {
      var config, handler, hash, origHandler, page, r, request, routed;
      origHandler = ns.Router.prototype.options.anchorhandler;
      request = null;
      config = {
        path: 'foo'
      };
      routed = true;
      hash = null;
      handler = function() {};
      r = new ns.Router(function(router) {
        return router.option({
          anchorhandler: handler
        });
      });
      page = r._createPage(request, config, routed, hash);
      notEqual(page._anchorhandler, origHandler, 'original anchorhandler was not there');
      return equal(page._anchorhandler, handler, 'anchorhandler was overridden by Router option');
    });
    test('Router _createPage anchorhandler via page config', function() {
      var config, handler, hash, origHandler, page, r, request, routed;
      origHandler = ns.Router.prototype.options.anchorhandler;
      handler = function() {};
      request = null;
      config = {
        path: 'foo',
        anchorhandler: handler
      };
      routed = true;
      hash = null;
      r = new ns.Router($.noop);
      page = r._createPage(request, config, routed, hash);
      notEqual(page._anchorhandler, origHandler, 'original anchorhandler was not there');
      return equal(page._anchorhandler, handler, 'original anchorhandler was overridden by page config');
    });
    test('Router _createPage anchorhandler ensure invocation on pageready', function() {
      var config, handler, hash, page, r, request, routed;
      expect(1);
      handler = function() {
        return ok(true, 'anchor handler was fired on pageready');
      };
      request = null;
      config = {
        path: 'foo',
        anchorhandler: handler
      };
      routed = true;
      hash = '#foo';
      r = new ns.Router($.noop);
      page = r._createPage(request, config, routed, hash);
      return page.trigger('pageready');
    });
    test('Router _createPage ajaxoptions via Router option', function() {
      var config, hash, newAjaxoptions, origAjaxoptions, page, r, request, routed;
      origAjaxoptions = ns.Router.prototype.options.ajaxoptions;
      newAjaxoptions = {
        dataType: 'html',
        cache: false
      };
      request = null;
      config = {
        path: 'foo'
      };
      routed = true;
      hash = null;
      r = new ns.Router(function(router) {
        return router.option({
          ajaxoptions: newAjaxoptions
        });
      });
      page = r._createPage(request, config, routed, hash);
      notEqual(page.options.ajaxoptions.dataType, origAjaxoptions.dataType, 'orignal dataType was not there');
      notEqual(page.options.ajaxoptions.cache, origAjaxoptions.cache, 'orignal cache was not there');
      equal(page.options.ajaxoptions.dataType, newAjaxoptions.dataType, 'new dataType was attached');
      return equal(page.options.ajaxoptions.cache, newAjaxoptions.cache, 'new cache was attached');
    });
    test('Router _createPage ajaxoptions via page config', function() {
      var config, hash, newAjaxoptions, origAjaxoptions, page, r, request, routed;
      origAjaxoptions = ns.Router.prototype.options.ajaxoptions;
      newAjaxoptions = {
        dataType: 'html',
        cache: false
      };
      request = null;
      config = {
        path: 'foo',
        ajaxoptions: newAjaxoptions
      };
      routed = true;
      hash = null;
      r = new ns.Router($.noop);
      page = r._createPage(request, config, routed, hash);
      notEqual(page.options.ajaxoptions.dataType, origAjaxoptions.dataType, 'orignal dataType was not there');
      notEqual(page.options.ajaxoptions.cache, origAjaxoptions.cache, 'orignal cache was not there');
      equal(page.options.ajaxoptions.dataType, newAjaxoptions.dataType, 'new dataType was attached');
      return equal(page.options.ajaxoptions.cache, newAjaxoptions.cache, 'new cache was attached');
    });
    test('Router _createPage hash ensure it was passed', function() {
      var config, hash, page, r, request, routed;
      request = null;
      config = {
        path: 'foo'
      };
      routed = true;
      hash = '#foobar';
      r = new ns.Router($.noop);
      page = r._createPage(request, config, routed, hash);
      return equal(page.hash, hash, "hash was passed: " + hash);
    });
    return test('Router _createPage hash ensure it was extracted from request.path', function() {
      var config, hash, page, r, request, routed;
      request = {
        path: 'foo#bar'
      };
      config = {
        path: 'foo'
      };
      routed = true;
      hash = null;
      r = new ns.Router($.noop);
      page = r._createPage(request, config, routed, hash);
      return equal(page.hash, '#bar', "extracted hash: " + page.hash);
    });
  })(jQuery, this, this.document);

}).call(this);
