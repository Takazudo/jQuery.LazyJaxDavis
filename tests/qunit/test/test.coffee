(($, window, document) ->

  # export
  ns = $.LazyJaxDavisNs
  wait = ns.wait

  # share this varname in whole test
  router = null

  # reset router everytime
  QUnit.testDone ->
    router?.stop()
    router = null


  # =================== start test ===================


  test 'util isToId', ->
    path = '#foobar'
    ok (ns.isToId path), path
    path = 'foobar'
    ok not (ns.isToId path), path
    path = ''
    ok not (ns.isToId path), path


  test 'util tryParseAnotherPageAnchor', ->

    path = '/somewhere/foo.html#bar'
    res = ns.tryParseAnotherPageAnchor path
    equal res.path, '/somewhere/foo.html', "#{path} - path: #{res.path}"
    equal res.hash, '#bar', "#{path} - hash: #{res.hash}"

    path = '#foobar'
    res = ns.tryParseAnotherPageAnchor path
    equal res, false, "#{path} - false"

    path = 'foobar'
    res = ns.tryParseAnotherPageAnchor path
    equal res, false, "#{path} - false"
    

  test 'util filterStr title parse', ->

    expr = ns.Router::options.expr.title
    runTest = (html, shouldbe) ->
      equal (ns.filterStr html, expr), shouldbe, html

    html = """
      <title>foobar</title>
    """
    shouldbe = 'foobar'
    runTest html, shouldbe

    html = """
      <title></title>
    """
    shouldbe = null
    runTest html, shouldbe

    html = """
      nothing here
    """
    shouldbe = null
    runTest html, shouldbe

    html = """
      <title attr="mewmew">foobar</title>
    """
    shouldbe = "foobar"
    runTest html, shouldbe
    
    html = """
      <title attr="mewmew">
        foobar  
        	</title>
    """
    shouldbe = "foobar"
    runTest html, shouldbe
    

  test 'util filterStr content parse', ->

    expr = ns.Router::options.expr.content
    runTest = (html, shouldbe) ->
      equal (ns.filterStr html, expr), shouldbe, html

    html = """
      <!-- LazyJaxDavis start -->
      foobar
      mewmew moomoo

      mooomoo
      <!-- LazyJaxDavis end -->
    """
    shouldbe = """
      foobar
      mewmew moomoo

      mooomoo
    """
    runTest html, shouldbe

    html = """
      <!-- LazyJaxDavis start -->
    """
    shouldbe = null
    runTest html, shouldbe

    html = """
      <!-- LazyJaxDavis end -->
    """
    shouldbe = null
    runTest html, shouldbe

    html = """
      nothing here
    """
    shouldbe = null
    runTest html, shouldbe

    html = """
xxx<!-- LazyJaxDavis start -->zzz
foobar
ooo<!-- LazyJaxDavis end -->zzz
    """
    shouldbe = """
zzz
foobar
ooo
    """
    runTest html, shouldbe

    html = """
mewmew
<!-- LazyJaxDavis start -->
foobar



foobar
foobar
<!-- LazyJaxDavis end -->
mewmew
    """
    shouldbe = """
foobar



foobar
foobar
    """
    runTest html, shouldbe
    

  test 'util filterStr captureAll', ->

    html = """
      <img src="foobar.gif"> <img src="moomoo.png">
      <img src="mewmew.gif">
    """

    res = ns.filterStr html, /src="([^"]+)"/gi, true
    type = $.type res

    equal type, 'array', "result type: #{type}"
    equal res.length, 3, "resutl length: #{res.length}"
    equal res[0], 'foobar.gif', "result[0]: #{res[0]}"
    equal res[1], 'moomoo.png', "result[1]: #{res[1]}"
    equal res[2], 'mewmew.gif', "result[2]: #{res[2]}"

    html = """
      asdfasdf
    """

    res = ns.filterStr html, /src="([^"]+)"/gi, true
    type = $.type res

    equal type, 'array', "result type: #{type}"
    equal res.length, 0, "resutl length: #{res.length}"


  asyncTest 'ajax fetchPage', ->
    
    expect 1
    check = (text) ->
      equal ($.trim text), 'DUMMY', "fetched text: #{text}"
    
    (ns.fetchPage 'dummy.html').then (text) ->
      check text
    , ->
      ok false, 'ajax failed'
    .always ->
      start()
    

  asyncTest 'ajax fetchPage call abort', ->
    
    expect 2
    
    res = ns.fetchPage 'dummy.html?12345'
    res.then ->
      ok false, 'ajax successed unexpectedly'
    , (aborted) ->
      ok true, 'ajax failed'
      ok aborted, 'was aborted'
    .always ->
      start()

    res.abort()
    

  asyncTest 'ajax fetchPage new requests let the active request abort', ->
    
    expect 5
    
    (ns.fetchPage 'dummy.html?asdfasdf').then ->
      ok false, '1st request: ajax successed unexpectedly'
    , (aborted) ->
      ok true, '1st request: ajax failed'
      ok aborted, '1st request: was aborted'

    (ns.fetchPage 'dummy.html?xyzxyz').then ->
      ok false, '2nd request: ajax successed unexpectedly'
    , (aborted) ->
      ok true, '2nd request: ajax failed'
      ok aborted, '2nd request: was aborted'

    (ns.fetchPage 'dummy.html?xyzxyz').then ->
      ok true, '3rd request: ajax successed'
    , (aborted) ->
      ok false, '3rd request: ajax failed'
    .always ->
      start()


  asyncTest 'Event - bind/trigger', ->

    expect 1
    eventer = new ns.Event
    eventer.bind 'foo', ->
      ok(true, 'foo event triggered')
      start()
    eventer.trigger 'foo'


  asyncTest 'Event - bind with args', ->

    expect 4
    eventer = new ns.Event
    eventer.bind 'foo', (arg1, arg2, arg3) ->
      ok(true, 'foo event triggered')
      equal(arg1, 1, 'arg was passed')
      equal(arg2, 2, 'arg was passed')
      equal(arg3, 3, 'arg was passed')
      start()
    eventer.trigger 'foo', 1, 2, 3


  asyncTest 'Event - unbind', ->

    expect 1
    eventer = new ns.Event
    eventer.bind 'foo', ->
      ok(false, 'event was fired')
    eventer.unbind 'foo'
    eventer.trigger 'foo'
    wait(0).done ->
      ok(true, 'event was not fired')
      start()


  asyncTest 'Event - one', ->

    expect 1
    eventer = new ns.Event
    eventer.one 'foo', ->
      ok(true, 'event was fired')
    eventer.trigger 'foo'
    eventer.trigger 'foo'
    eventer.trigger 'foo'
    wait(0).done ->
      start()

  
  test 'HistoryLogger', ->
    
    logger = new ns.HistoryLogger
    equal logger.size(), 1, 'first url will be added automatically'
    for i in [1..10]
      logger.push 'foobar'
    logger.push 'moomoo'
    equal logger.size(), 12, logger._items
    equal logger.last(), 'moomoo'

  
  test 'HistoryLogger isToSamePageRequst', ->
    
    logger = new ns.HistoryLogger
    for i in [1..10]
      logger.push "foobar#{i}"
    ok (logger.isToSamePageRequst "foobar10"), 'was same request'


  test 'Page instance creation', ->

    request = { path: 'foobar' }
    config = null
    routed = false
    router = null
    options = null

    page = new ns.Page request, config, routed, router, options
    ok page, 'instance creation successed'
    equal page.path, 'foobar', "path is #{page.path}"

    
  asyncTest 'Page fetch', ->

    expect 2

    request = { path: 'dummy.html' }
    config = null
    routed = false
    router = null
    options = null

    page = new ns.Page request, config, routed, router, options
    page.fetch().done ->
      ok true, 'ajax completed'
      equal ($.trim page._text), 'DUMMY', 'fetched text was what I expected.'
    .always ->
      start()
      

  asyncTest 'Page fetch events abort', ->

    expect 1
    
    request = { path: 'dummy.html' }
    config = null
    routed = false
    router = null
    options =null
      
    page = new ns.Page request, config, routed, router, options

    fetchDefer = page.fetch()
    fetchDefer.then ->
      ok false, '1st fetch successed'
    , (error) ->
      ok error.aborted, '1st fetch aborted'
    .always ->
      start()

    fetchDefer.abort()
      

  asyncTest 'Page fetch events fail', ->

    expect 2
    
    request = { path: 'nothinghere.html' }
    config = null
    routed = false
    router = null
    options =null
      
    page = new ns.Page request, config, routed, router, options

    page.fetch().then ->
      ok false, 'ajax failed'
    , (error) ->
      ok true, 'ajax failed'
      ok not error.aborted, 'ajax was not aborted'
    .always ->
      start()
      

  asyncTest 'Page rip', ->

    expect 3
    
    request = { path: 'dummy2.html' }
    config = null
    routed = false
    router = null
    options =
      expr:
        title: /<title[^>]*>([^<]*)<\/title>/
        content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
      
    page = new ns.Page request, config, routed, router, options

    page.fetch().done ->
      expected = """
foobar
foobar
<title>changed title</title>
foobar
<!-- LazyJaxDavis start -->
content here
content here
content here
content here
<!-- LazyJaxDavis end -->
booboo
"""
      equal ($.trim page.rip()), expected, expected
      
      expected = "changed title"
      equal page.rip('title'), expected, expected

      expected = """
content here
content here
content here
content here
"""
      equal page.rip('content'), expected, expected

    .always ->
      start()
      

  test 'Page rip fail', ->

    expect 2
    
    request = { path: 'dummy2.html' }
    config = null
    routed = false
    router = null
    options =
      expr: null
      
    page = new ns.Page request, config, routed, router, options
    equal page.rip('thisKeyDoesNotExist'), null, 'requested key was not defined'
    equal page.rip(), null, 'notfetched yet so rip returns null'


  test 'Router new', ->
    
    r1 = new ns.Router $.noop

    ok r1 instanceof ns.Router, 'create instance with new'
    ok r1.history instanceof ns.HistoryLogger, 'history logger was attached'
    
  
  asyncTest 'Page rip captureAll', 4, ->

    request = { path: 'dummy4.html' }
    config = null
    routed = false
    router = null
    options =
      updatetitle: false
      expr:
        title: /<title[^>]*>([^<]*)<\/title>/
        content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
        imgsrc: /src="([^"]+)"/gi
      
    page = new ns.Page request, config, routed, router, options

    page.fetch().done ->
      res = page.ripAll('imgsrc')
      type = $.type res
      equal type, 'array', "ripped reuslt type: #{type}"
      equal res[0], 'foobar.gif', "result[0]: #{res[0]}"
      equal res[1], 'moomoo.png', "result[1]: #{res[1]}"
      equal res[2], 'mewmew.gif', "result[2]: #{res[2]}"
    .always ->
      start()
      

  asyncTest 'Page rip captureAll matched nothing', 2, ->

    request = { path: 'dummy5.html' }
    config = null
    routed = false
    router = null
    options =
      updatetitle: false
      expr:
        title: /<title[^>]*>([^<]*)<\/title>/
        content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
        imgsrc: /src="([^"]+)"/gi
      
    page = new ns.Page request, config, routed, router, options

    page.fetch().done ->
      res = page.ripAll('imgsrc')
      type = $.type res
      equal type, 'array', "ripped reuslt type: #{type}"
      equal res.length, 0, "result's length: #{res.length}"
    .always ->
      start()
      

  test 'Router initializer', ->

    exported = null
    r = new ns.Router (arg) ->
      exported = arg
    equal r, exported, 'router passes router instance to initializer'
    
  
  test 'Router initializer option', ->

    origOptVal = true
    r = new ns.Router (router) ->
      router.option
        firereadyonstart: false
    equal r.options.firereadyonstart, false, '.option overrided default value'
    
  
  test 'Router initializer route', ->

    r = new ns.Router (router) ->
      router.route [
        {
          path: 'foobar'
          pageready: $.noop
        }
      ]
    ok r.pages, '.route worked w/o error'
    
  
  test 'Router initializer routeDavis', ->

    r = new ns.Router (router) ->
      router.routeDavis ->
        @get 'foobar', ->
    ok r.davis, '.routeDavis worked w/o error'
    
  
  test 'Router event', ->

    expect 1

    r = new ns.Router (router) ->
      router.bind 'foo', ->
        ok true, 'event was successed to trigger'
    r.trigger 'foo'


  test 'Router _findWhosePathMatches', ->

    page1 = { path: 'foo' }
    page2 = { path: 'bar' }
    page3 = { path: 'mew' }
    page4 = { path: 'moo' }
    pages = []
    pages.push page1
    pages.push page2
    pages.push page3
    pages.push page4
    
    r = new ns.Router (router) ->
      router.route pages

    equal (r._findWhosePathMatches 'page', 'foo'), page1, 'page was found'
    equal (r._findWhosePathMatches 'page', 'bar'), page2, 'page was found'
    equal (r._findWhosePathMatches 'page', 'mew'), page3, 'page was found'
    equal (r._findWhosePathMatches 'page', 'moo'), page4, 'page was found'

  
  test 'Router _findWhosePathMatches ignore getvals via page config', ->

    page1 = { path: 'foo', ignoregetvals: true }
    page2 = { path: 'bar', ignoregetvals: false }
    page3 = { path: 'mew', ignoregetvals: true }
    page4 = { path: 'moo' }
    pages = []
    pages.push page1
    pages.push page2
    pages.push page3
    pages.push page4
    
    r = new ns.Router (router) ->
      router.route pages

    equal (r._findWhosePathMatches 'page', 'foo?xxx=yyy'), page1, 'get values were ignored'
    equal (r._findWhosePathMatches 'page', 'bar?xxx=yyy'), null, 'get values were not ignored'
    equal (r._findWhosePathMatches 'page', 'mew?xxx=yyy'), page3, 'get values were ignored'
    equal (r._findWhosePathMatches 'page', 'moo?xxx=yyy'), null, 'get values were not ignored'

  
  test 'Router _findWhosePathMatches ignore getvals via Router config', ->

    page1 = { path: 'foo' }
    page2 = { path: 'bar' }
    page3 = { path: 'mew' }
    page4 = { path: 'moo' }
    pages = []
    pages.push page1
    pages.push page2
    pages.push page3
    pages.push page4
    
    r = new ns.Router (router) ->
      router.option
        ignoregetvals: true
      router.route pages

    equal (r._findWhosePathMatches 'page', 'foo?xxx=yyy'), page1, 'get values were ignored'
    equal (r._findWhosePathMatches 'page', 'bar?xxx=yyy'), page2, 'get values were ignored'
    equal (r._findWhosePathMatches 'page', 'mew?xxx=yyy'), page3, 'get values were ignored'
    equal (r._findWhosePathMatches 'page', 'moo?xxx=yyy'), page4, 'get values were ignored'

  
  test 'Router _findWhosePathMatches handleMulti', ->

    page1 = { path: 'foo' }
    page2 = { path: 'bar' }
    page3 = { path: 'foo' }
    page4 = { path: 'moo' }
    pages = []
    pages.push page1
    pages.push page2
    pages.push page3
    pages.push page4
    
    r = new ns.Router (router) ->
      router.route pages

    res = r._findWhosePathMatches 'page', 'foo', true
    equal res.length, 2, 'found 2 pages as array'
    equal res[0], page1, 'matched page was correct'
    equal res[1], page3, 'matched page was correct'

    equal (r._findWhosePathMatches 'page', 'bar', true)[0], page2, 'found 1 page as array'
    equal (r._findWhosePathMatches 'page', 'moo', true)[0], page4, 'found 1 page as array'

  
  test 'Router _findWhosePathMatches pathexpr', ->

    page1 = { path: /foo/ }
    page2 = { path: /bar/ }
    page3 = { path: /mew/ }
    page4 = { path: /moo/ }
    pages = []
    pages.push page1
    pages.push page2
    pages.push page3
    pages.push page4
    
    r = new ns.Router (router) ->
      router.route pages

    equal (r._findWhosePathMatches 'page', 'foo'), page1, 'page was found'
    equal (r._findWhosePathMatches 'page', 'bar'), page2, 'page was found'
    equal (r._findWhosePathMatches 'page', 'mew'), page3, 'page was found'
    equal (r._findWhosePathMatches 'page', 'moo'), page4, 'page was found'
  
  test 'Router _createPage', ->

    request = null
    config =
      path: 'foo'
    routed = true
    hash = null
    
    r = new ns.Router $.noop
    page = r._createPage request, config, routed, hash
    ok page instanceof ns.Page, 'create instance'

  
  test 'Router _createPage anchorhandler via route option', ->

    origHandler = ns.Router::options.anchorhandler
    request = null
    config =
      path: 'foo'
    routed = true
    hash = null

    handler = ->
    r = new ns.Router (router) ->
      router.option
        anchorhandler: handler
    page = r._createPage request, config, routed, hash
    notEqual page._anchorhandler, origHandler, 'original anchorhandler was not there'
    equal page._anchorhandler, handler, 'anchorhandler was overridden by Router option'

  
  test 'Router _createPage anchorhandler via page config', ->

    origHandler = ns.Router::options.anchorhandler
    handler = ->
    request = null
    config =
      path: 'foo'
      anchorhandler: handler
    routed = true
    hash = null

    r = new ns.Router $.noop
    page = r._createPage request, config, routed, hash
    notEqual page._anchorhandler, origHandler, 'original anchorhandler was not there'
    equal page._anchorhandler, handler, 'original anchorhandler was overridden by page config'

  
  test 'Router _createPage anchorhandler ensure invocation on pageready', ->

    expect 1

    handler = -> ok true, 'anchor handler was fired on pageready'
    request = null
    config =
      path: 'foo'
      anchorhandler: handler
    routed = true
    hash = '#foo'

    r = new ns.Router $.noop
    page = r._createPage request, config, routed, hash
    page.trigger 'pageready'


  test 'Router _createPage ajaxoptions via Router option', ->

    origAjaxoptions = ns.Router::options.ajaxoptions
    newAjaxoptions =
      dataType: 'html'
      cache: false
    
    request = null
    config =
      path: 'foo'
    routed = true
    hash = null

    r = new ns.Router (router) ->
      router.option
        ajaxoptions: newAjaxoptions

    page = r._createPage request, config, routed, hash
    notEqual page.options.ajaxoptions.dataType, origAjaxoptions.dataType, 'orignal dataType was not there'
    notEqual page.options.ajaxoptions.cache, origAjaxoptions.cache, 'orignal cache was not there'
    equal page.options.ajaxoptions.dataType, newAjaxoptions.dataType, 'new dataType was attached'
    equal page.options.ajaxoptions.cache, newAjaxoptions.cache, 'new cache was attached'


  test 'Router _createPage ajaxoptions via page config', ->

    origAjaxoptions = ns.Router::options.ajaxoptions
    newAjaxoptions =
      dataType: 'html'
      cache: false
    
    request = null
    config =
      path: 'foo'
      ajaxoptions: newAjaxoptions
    routed = true
    hash = null

    r = new ns.Router $.noop

    page = r._createPage request, config, routed, hash
    notEqual page.options.ajaxoptions.dataType, origAjaxoptions.dataType, 'orignal dataType was not there'
    notEqual page.options.ajaxoptions.cache, origAjaxoptions.cache, 'orignal cache was not there'
    equal page.options.ajaxoptions.dataType, newAjaxoptions.dataType, 'new dataType was attached'
    equal page.options.ajaxoptions.cache, newAjaxoptions.cache, 'new cache was attached'


  test 'Router _createPage hash ensure it was passed', ->

    request = null
    config =
      path: 'foo'
    routed = true
    hash = '#foobar'
    
    r = new ns.Router $.noop
    page = r._createPage request, config, routed, hash
    equal page.hash, hash, "hash was passed: #{hash}"


  test 'Router _createPage hash ensure it was extracted from request.path', ->

    request =
      path: 'foo#bar'
    config =
      path: 'foo'
    routed = true
    hash = null
    
    r = new ns.Router $.noop
    page = r._createPage request, config, routed, hash
    equal page.hash, '#bar', "extracted hash: #{page.hash}"



    
    
    

  


) jQuery, @, @document
