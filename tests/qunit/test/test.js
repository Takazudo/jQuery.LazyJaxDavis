
(function($, window, document) {
  var ns, router, wait;
  ns = $.LazyJaxDavisNs;
  wait = ns.wait;
  router = null;
  QUnit.testDone(function() {
    if (router != null) router.stop();
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
    res = (ns.fetchPage('dummy.html?12345')).then(function() {
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
    var i, logger;
    logger = new ns.HistoryLogger;
    equal(logger.size(), 1, 'first url will be added automatically');
    for (i = 1; i <= 10; i++) {
      logger.push('foobar');
    }
    logger.push('moomoo');
    equal(logger.size(), 12, logger._items);
    return equal(logger.last(), 'moomoo');
  });
  test('HistoryLogger isToSamePageRequst', function() {
    var i, logger;
    logger = new ns.HistoryLogger;
    for (i = 1; i <= 10; i++) {
      logger.push("foobar" + i);
    }
    return ok(logger.isToSamePageRequst("foobar10"), 'was same request');
  });
  test('Page', function() {
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
  asyncTest('Page fetch events', function() {
    var config, options, page, request, routed;
    expect(4);
    request = {
      path: 'dummy.html'
    };
    config = {
      fetchstart: function() {
        return ok(true, 'fetchstart fired');
      },
      fetchsuccess: function() {
        return ok(true, 'fetchsuccess fired');
      },
      fetchabort: function() {
        return ok(false, 'fetchabort fired');
      },
      fetchfail: function() {
        return ok(false, 'fetchfail fired');
      }
    };
    routed = false;
    router = null;
    options = null;
    page = new ns.Page(request, config, routed, router, options);
    return page.fetch().done(function() {
      return page.fetch().done(function() {
        return start();
      });
    });
  });
  asyncTest('Page fetch events via bind method', function() {
    var config, options, page, request, routed;
    expect(4);
    request = {
      path: 'dummy.html'
    };
    config = null;
    routed = false;
    router = null;
    options = null;
    page = new ns.Page(request, config, routed, router, options);
    page.bind('fetchstart', function() {
      return ok(true, 'fetchstart fired');
    });
    page.bind('fetchsuccess', function() {
      return ok(true, 'fetchsuccess fired');
    });
    page.bind('fetchabort', function() {
      return ok(false, 'fetchabort fired');
    });
    page.bind('fetchfail', function() {
      return ok(false, 'fetchfail fired');
    });
    return page.fetch().done(function() {
      return page.fetch().done(function() {
        return start();
      });
    });
  });
  asyncTest('Page fetch events abort', function() {
    var config, options, page, request, routed;
    expect(2);
    request = {
      path: 'dummy.html'
    };
    config = {
      fetchstart: function() {
        return ok(true, 'fetchstart fired');
      },
      fetchsuccess: function() {
        return ok(false, 'fetchsuccess fired');
      },
      fetchabort: function() {
        return ok(true, 'fetchabort fired');
      },
      fetchfail: function() {
        return ok(false, 'fetchfail fired');
      }
    };
    routed = false;
    router = null;
    options = null;
    page = new ns.Page(request, config, routed, router, options);
    page.fetch().always(function() {
      return start();
    });
    return page.abort();
  });
  asyncTest('Page fetch events abort 2nd page fetching make 1st abort', function() {
    var config, options, page1, page2, request, routed;
    expect(4);
    request = {
      path: 'dummy.html'
    };
    routed = false;
    router = null;
    options = null;
    config = {
      fetchstart: function() {
        return ok(true, '1st fetchstart fired');
      },
      fetchsuccess: function() {
        return ok(false, '1st fetchsuccess fired');
      },
      fetchabort: function() {
        return ok(true, '1st fetchabort fired');
      },
      fetchfail: function() {
        return ok(false, '1st fetchfail fired');
      }
    };
    page1 = new ns.Page(request, config, routed, router, options);
    config = {
      fetchstart: function() {
        return ok(true, '2nd fetchstart fired');
      },
      fetchsuccess: function() {
        return ok(true, '2nd fetchsuccess fired');
      },
      fetchabort: function() {
        return ok(false, '2nd fetchabort fired');
      },
      fetchfail: function() {
        return ok(false, '2nd fetchfail fired');
      }
    };
    page2 = new ns.Page(request, config, routed, router, options);
    page1.fetch();
    return page2.fetch().always(function() {
      return start();
    });
  });
  asyncTest('Page fetch events fail', function() {
    var config, options, page, request, routed;
    expect(2);
    request = {
      path: 'nothinghere.html'
    };
    config = {
      fetchstart: function() {
        return ok(true, '1st fetchstart fired');
      },
      fetchsuccess: function() {
        return ok(false, '1st fetchsuccess fired');
      },
      fetchabort: function() {
        return ok(false, '1st fetchabort fired');
      },
      fetchfail: function() {
        return ok(true, '1st fetchfail fired');
      }
    };
    routed = false;
    router = null;
    options = null;
    page = new ns.Page(request, config, routed, router, options);
    return page.fetch().always(function() {
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
  return test('Page rip fail', function() {
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
})(jQuery, this, this.document);
