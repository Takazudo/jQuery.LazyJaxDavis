(($, win) ->

  # export
  ns = $.LazyJaxDavisNs
  wait = ns.wait

  # share this varname in whole test
  router = null

  # reset router everytime
  QUnit.testDone ->
    router?.destroy()
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

    expr = ns.Router::options.exprTitle
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

    expr = ns.Router::options.exprContent
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
    
    res = (ns.fetchPage 'dummy.html?12345').then ->
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

  
  $ ->
    
    # main

#    test 'ensure globals', ->
#
#      ok $.ui
#      ok $.ui.domwindowdialog
#      ok $.ui.domwindow
#      ok $.ui.hideoverlay
#      ok win.domwindowNs
#
#
#    test 'utils viewport', ->
#
#      w = ns.viewportH()
#      h = ns.viewportW()
#      x = ns.offsetX()
#      y = ns.offsetY()
#      
#      equal $.type(w), 'number', "viewportW: #{w}"
#      equal $.type(h), 'number', "viewportH: #{h}"
#      equal $.type(x), 'number', "offsetX: #{x}"
#      equal $.type(y), 'number', "offsetY: #{y}"
#
#
#    test 'hideoverlay setup', ->
#
#      $.ui.hideoverlay.setup()
#      ok ns.widgets.$overlay.size(), '$overlay found'
#
#
#    test 'hideoverlay destroy', ->
#
#      $.ui.hideoverlay.setup()
#      ok ns.widgets.$overlay.size(), '$overlay found'
#      $.ui.hideoverlay.destroy()
#      ok not ns.widgets.$overlay, '$overlay was not found'
#
#
#    asyncTest 'hideoverlay events', ->
#
#      expect 4
#
#      $overlay = $.ui.hideoverlay.setup
#        showstart: ->
#          ok true, 'showstart fired'
#        showend: ->
#          ok true, 'showend fired'
#          wait(0).done -> $overlay.hideoverlay 'hide'
#        hidestart: ->
#          ok true, 'hidestart fired'
#        hideend: ->
#          ok true, 'showend fired'
#          start()
#
#      $overlay.hideoverlay 'show'
#
#
#    test 'domwindowdialog setup', ->
#
#      $.ui.domwindowdialog.setup()
#      ok win.domwindowApi, 'api found'
#      ok ns.widgets.$dialog.size(), '$dialog found'
#      ok ns.widgets.$overlay.size(), '$overlay found'
#
#
#    test 'domwindowdialog destroy', ->
#
#      $.ui.domwindowdialog.setup()
#      ok win.domwindowApi, 'api found'
#      ok ns.widgets.$dialog.size(), '$dialog found'
#      ok ns.widgets.$overlay.size(), '$overlay found'
#      $.ui.domwindowdialog.destroy()
#      ok not ns.widgets.$dialog, '$dialog was not found'
#      ok ns.widgets.$overlay, '$overlay was still there'
#
#
#    test 'domwindowdialog setup override', ->
#
#      $.ui.domwindowdialog.setup
#        width: 100
#        height: 200
#      o = ns.widgets.$dialog.domwindowdialog 'option'
#      equal o.width, 100, '1st setup - width'
#      equal o.height, 200, '1st setup - height'
#
#      $.ui.domwindowdialog.setup
#        width: 300
#        height: 400
#      o = ns.widgets.$dialog.domwindowdialog 'option'
#      equal o.width, 300, '2nd setup - width'
#      equal o.height, 400, '2nd setup - height'
#
#
#    asyncTest 'domwindowdialog events passed via open', ->
#
#      expect 8
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#      api = win.domwindowApi
#      $dialog = ns.widgets.$dialog
#
#      api.open 'dialogfragment.html',
#        beforeopen: (e, data) ->
#          ok true, 'beforeopen'
#          equal data.dialog[0], $dialog[0], 'beforeopen: dialog was passed'
#        afteropen: (e, data) ->
#          ok true, 'afteropen'
#          equal data.dialog[0], $dialog[0], 'afteropen: dialog was passed'
#          wait(0).done -> api.close()
#        beforeclose: (e, data) ->
#          ok true, 'beforeclose'
#          equal data.dialog[0], $dialog[0], 'beforeclose: dialog was passed'
#        afterclose: (e, data) ->
#          ok true, 'afterclose'
#          equal data.dialog[0], $dialog[0], 'afterclose: dialog was passed'
#          start()
#
#
#    asyncTest 'domwindowdialog events passed via jquery binding', ->
#
#      expect 12
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#      api = win.domwindowApi
#      $dialog = ns.widgets.$dialog
#
#      $dialog.on 'domwindowdialog.beforeopen', (e, data) ->
#        ok true, 'beforeopen'
#        equal data.dialog[0], $dialog[0], 'beforeopen - data.dialog is dialogEl'
#        equal @, $dialog[0], 'beforeopen - this is dialogEl'
#
#      $dialog.on 'domwindowdialog.afteropen', (e, data) ->
#        ok true, 'afteropen'
#        equal data.dialog[0], $dialog[0], 'afteropen - data.dialog is dialogEl'
#        equal @, $dialog[0], 'afteropen - this is dialogEl'
#        wait(0).done -> api.close()
#
#      $dialog.on 'domwindowdialog.beforeclose', (e, data) ->
#        ok true, 'beforeclose'
#        equal data.dialog[0], $dialog[0], 'beforeclose - data.dialog is dialogEl'
#        equal @, $dialog[0], 'beforeclose - this is dialogEl'
#
#      $dialog.on 'domwindowdialog.afterclose', (e, data) ->
#        ok true, 'afterclose'
#        equal data.dialog[0], $dialog[0], 'afterclose - data.dialog is dialogEl'
#        equal @, $dialog[0], 'afterclose - this is dialogEl'
#        start()
#
#      api.open 'dialogfragment.html'
#
#
#    asyncTest 'domwindowdialog events passed via setup', ->
#
#      expect 4
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#        beforeopen: ->
#          ok true, 'beforeopen'
#        afteropen: ->
#          ok true, 'afteropen'
#          wait(0).done -> api.close()
#        beforeclose: ->
#          ok true, 'beforeclose'
#        afterclose: ->
#          ok true, 'afterclose'
#          start()
#
#      api = win.domwindowApi
#      api.open 'dialogfragment.html',
#
#
#    asyncTest 'domwindowdialog events passed via setup ensure events are fired everytime', ->
#
#      expect 13
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#        beforeopen: ->
#          ok true, 'beforeopen'
#        afteropen: ->
#          ok true, 'afteropen'
#          wait(0).done -> api.close()
#        beforeclose: ->
#          ok true, 'beforeclose'
#        afterclose: ->
#          ok true, 'afterclose'
#
#      api = win.domwindowApi
#      api.open 'dialogfragment.html',
#        afterclose: ->
#          api.open 'dialogfragment.html',
#            afterclose: ->
#              api.open 'dialogfragment.html',
#                afterclose: ->
#                  ok true, 'everything worked'
#                  start()
#
#
#    asyncTest 'domwindowdialog events passed via close', ->
#
#      expect 4
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#      api = win.domwindowApi
#
#      api.open 'dialogfragment.html',
#        beforeopen: ->
#          ok true, 'beforeopen'
#        afteropen: ->
#          ok true, 'afteropen'
#          wait(0).done ->
#            api.close
#              beforeclose: ->
#                ok true, 'beforeclose'
#              afterclose: ->
#                ok true, 'afterclose'
#                start()
#
#
#    asyncTest 'domwindowdialog events ensure complicated events are all fired', ->
#
#      expect 15
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#        beforeopen: -> ok true, 'beforeopen - via setup' # will be fired twice
#        afteropen: -> ok true, 'afteropen - via setup' # will be fired twice
#        beforeclose: -> ok true, 'beforeclose - via setup' # will be fired twice
#        afterclose: -> ok true, 'afterclose - via setup' # will be fired twice
#
#      api = win.domwindowApi
#
#      firstOpen = ->
#
#        api.open 'dialogfragment.html',
#          beforeopen: -> ok true, 'beforeopen - via open' # will be fired once
#          afteropen: ->
#            ok true, 'afteropen - via open' # will be fired once
#            wait(0).done ->
#              api.close
#                beforeclose: ->
#                  ok true, 'beforeclose - via close' # will be fired once
#                afterclose: ->
#                  ok true, 'afterclose - via close' # will be fired once
#                  secondOpen()
#          beforeclose: -> ok true, 'beforeclose - via open' # will be fired once
#          afterclose: -> ok true, 'afterclose - via open' # will be fired once
#
#      secondOpen = ->
#
#        api.open 'dialogfragment.html',
#          afteropen: -> wait(0).done -> api.close()
#          afterclose: ->
#            ok true, 'afterclose - via open' # will be fired once
#            start()
#
#      firstOpen()
#
#    asyncTest 'domwindowdialog ajaxdialog', ->
#
#      expect 1
#
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#      api = win.domwindowApi
#
#      api.open 'dialogfragment.html',
#        afteropen: (e, data) ->
#          equal (data.dialog.find '.woot').text(), 'woot', 'fetched html was in dialog'
#          wait(0).done -> api.close()
#        afterclose: ->
#          start()
#
#    
#    asyncTest 'domwindowdialog iframedialog', ->
#
#      expect 1
#
#      $.ui.domwindowdialog.setup
#        iframedialog: true
#      api = win.domwindowApi
#
#      api.open 'dialogfragment.html',
#        afteropen: (e, data) ->
#          ok (data.dialog.find 'iframe').size(), 'iframe was in dialog'
#          wait(0).done -> api.close()
#        afterclose: ->
#          start()
#
#
#    asyncTest 'domwindowdialog iddialog', ->
#
#      expect 1
#
#      $testdiv.html """
#        <script type="text/x-dialogcontent" id="foobar"><i>foobar</i></script>
#      """
#      $.ui.domwindowdialog.setup
#        iddialog: true
#      api = win.domwindowApi
#
#      api.open 'foobar',
#        afteropen: (e, data) ->
#          equal (data.dialog.find 'i').text(), 'foobar', 'fetched html was in dialog'
#          wait(0).done -> api.close()
#        afterclose: ->
#          $testdiv.empty()
#          start()
#
#
#    asyncTest 'domwindowdialog iddialog via passing #id string', ->
#
#      expect 1
#
#      $testdiv.html """
#        <script type="text/x-dialogcontent" id="foobar"><i>foobar</i></script>
#      """
#      $.ui.domwindowdialog.setup
#        ajaxdialog: true
#      api = win.domwindowApi
#
#      api.open '#foobar',
#        afteropen: (e, data) ->
#          equal (data.dialog.find 'i').text(), 'foobar', 'fetched html was in dialog'
#          wait(0).done -> api.close()
#        afterclose: ->
#          $testdiv.empty()
#          start()
#
#
#    asyncTest 'domwindowdialog deferredopen', ->
#
#      expect 2
#
#      $.ui.domwindowdialog.setup()
#      api = win.domwindowApi
#
#      api.open (defer) ->
#        wait(0).done -> defer.resolve('<div class="moo">moo<div>')
#      ,
#        afteropen: (e, data) ->
#          ok true, 'deferredopen worked'
#          equal (data.dialog.find '.moo').text(), 'moo', 'attached html was in dialog'
#          wait(0).done -> api.close()
#        afterclose: ->
#          start()
#
#
#    asyncTest 'widgetstyle events', ->
#      
#      expect 18
#
#      $dialog = $.ui.domwindowdialog.setup()
#      $testdiv.html """
#        <script type="text/x-dialogcontent" id="foobar"><i>foobar</i></script>
#      """
#      $domwin = $testdiv.find('#foobar').domwindow()
#      domwin = $domwin.data 'domwindow'
#
#      firstClose = $.Deferred()
#      secondClose = $.Deferred()
#
#      $domwin.on 'domwindow.beforeopen', (e, data) ->
#        ok true, 'beforeopen - fired'
#        equal $dialog[0], data.dialog[0], 'beforeopen - dialog was passed'
#
#      $domwin.on 'domwindow.afteropen', (e, data) ->
#        ok true, 'afteropen - fired'
#        equal $dialog[0], data.dialog[0], 'afteropen - dialog was passed'
#        ok (data.dialog.find('i').size() is 1), 'afteropen - found attached html in dialog'
#        wait(0).done -> domwin.close()
#
#      $domwin.on 'domwindow.beforeclose', (e, data) ->
#        ok true, 'beforeclose - fired'
#        equal $dialog[0], data.dialog[0], 'beforeclose - dialog was passed'
#
#      $domwin.on 'domwindow.afterclose', (e, data) ->
#        ok true, 'afterclose - fired'
#        equal $dialog[0], data.dialog[0], 'afterclose - dialog was passed'
#        if not firstClose.isResolved()
#          firstClose.resolve()
#        else
#          secondClose.resolve()
#
#      firstClose.done -> domwin.open()
#      secondClose.done -> start()
#      domwin.open()
#
#
#    asyncTest 'widgetstyle events ensure they work with api call', ->
#      
#      expect 18
#
#      $dialog = $.ui.domwindowdialog.setup
#        iddialog: true
#      $testdiv.html """
#        <script type="text/x-dialogcontent" id="foobar"><i>foobar</i></script>
#      """
#      api = win.domwindowApi
#      $domwin = $testdiv.find('#foobar').domwindow()
#      domwin = $domwin.data 'domwindow'
#
#      firstClose = $.Deferred()
#      secondClose = $.Deferred()
#
#      $domwin.on 'domwindow.beforeopen', (e, data) ->
#        ok true, 'beforeopen - fired'
#        equal $dialog[0], data.dialog[0], 'beforeopen - dialog was passed'
#
#      $domwin.on 'domwindow.afteropen', (e, data) ->
#        ok true, 'afteropen - fired'
#        equal $dialog[0], data.dialog[0], 'afteropen - dialog was passed'
#        ok (data.dialog.find('i').size() is 1), 'afteropen - found attached html in dialog'
#        wait(0).done -> api.close()
#
#      $domwin.on 'domwindow.beforeclose', (e, data) ->
#        ok true, 'beforeclose - fired'
#        equal $dialog[0], data.dialog[0], 'beforeclose - dialog was passed'
#
#      $domwin.on 'domwindow.afterclose', (e, data) ->
#        ok true, 'afterclose - fired'
#        equal $dialog[0], data.dialog[0], 'afterclose - dialog was passed'
#        if not firstClose.isResolved()
#          firstClose.resolve()
#        else
#          secondClose.resolve()
#
#      firstClose.done -> domwin.open()
#      secondClose.done -> start()
#      api.open 'foobar'


) jQuery, @
#test("module without setup/teardown (default)", function() {
#	expect(1);
#	ok(true);
#});
#
#test("expect in test", 3, function() {
#	ok(true);
#	ok(true);
#	ok(true);
#});
#
#test("expect in test", 1, function() {
#	ok(true);
#});
#
#module("setup test", {
#	setup: function() {
#		ok(true);
#	}
#});
#
#test("module with setup", function() {
#	expect(2);
#	ok(true);
#});
#
#test("module with setup, expect in test call", 2, function() {
#	ok(true);
#});
#
#var state;
#
#module("setup/teardown test", {
#	setup: function() {
#		state = true;
#		ok(true);
#		x = 1;
#	},
#	teardown: function() {
#		ok(true);
#		// can introduce and delete globals in setup/teardown
#		// without noglobals sounding the alarm
#		delete x;
#	}
#});
#
#test("module with setup/teardown", function() {
#	expect(3);
#	ok(true);
#});
#
#module("setup/teardown test 2");
#
#test("module without setup/teardown", function() {
#	expect(1);
#	ok(true);
#});
#
#if (typeof setTimeout !== 'undefined') {
#state = 'fail';
#
#module("teardown and stop", {
#	teardown: function() {
#		equal(state, "done", "Test teardown.");
#	}
#});
#
#test("teardown must be called after test ended", function() {
#	expect(1);
#	stop();
#	setTimeout(function() {
#		state = "done";
#		start();
#	}, 13);
#});
#
#test("parameter passed to stop increments semaphore n times", function() {
#	expect(1);
#	stop(3);
#	setTimeout(function() {
#		state = "not enough starts";
#		start(), start();
#	}, 13);
#	setTimeout(function() {
#		state = "done";
#		start();
#	}, 15);
#});
#
#test("parameter passed to start decrements semaphore n times", function() {
#	expect(1);
#	stop(), stop(), stop();
#	setTimeout(function() {
#		state = "done";
#		start(3);
#	}, 18);
#});
#
#module("async setup test", {
#	setup: function() {
#		stop();
#		setTimeout(function(){
#			ok(true);
#			start();
#		}, 500);
#	}
#});
#
#asyncTest("module with async setup", function() {
#	expect(2);
#	ok(true);
#	start();
#});
#
#module("async teardown test", {
#	teardown: function() {
#		stop();
#		setTimeout(function(){
#			ok(true);
#			start();
#		}, 500);
#	}
#});
#
#asyncTest("module with async teardown", function() {
#	expect(2);
#	ok(true);
#	start();
#});
#
#module("asyncTest");
#
#asyncTest("asyncTest", function() {
#	expect(2);
#	ok(true);
#	setTimeout(function() {
#		state = "done";
#		ok(true);
#		start();
#	}, 13);
#});
#
#asyncTest("asyncTest", 2, function() {
#	ok(true);
#	setTimeout(function() {
#		state = "done";
#		ok(true);
#		start();
#	}, 13);
#});
#
#test("sync", 2, function() {
#	stop();
#	setTimeout(function() {
#		ok(true);
#		start();
#	}, 13);
#	stop();
#	setTimeout(function() {
#		ok(true);
#		start();
#	}, 125);
#});
#
#test("test synchronous calls to stop", 2, function() {
#	stop();
#	setTimeout(function(){
#		ok(true, 'first');
#		start();
#		stop();
#		setTimeout(function(){
#			ok(true, 'second');
#			start();
#		}, 150);
#	}, 150);
#});
#}
#
#module("save scope", {
#	setup: function() {
#		this.foo = "bar";
#	},
#	teardown: function() {
#		deepEqual(this.foo, "bar");
#	}
#});
#test("scope check", function() {
#	expect(2);
#	deepEqual(this.foo, "bar");
#});
#
#module("simple testEnvironment setup", {
#	foo: "bar",
#	bugid: "#5311" // example of meta-data
#});
#test("scope check", function() {
#	deepEqual(this.foo, "bar");
#});
#test("modify testEnvironment",function() {
#	expect(0);
#	this.foo="hamster";
#});
#test("testEnvironment reset for next test",function() {
#	deepEqual(this.foo, "bar");
#});
#
#module("testEnvironment with object", {
#	options:{
#		recipe:"soup",
#		ingredients:["hamster","onions"]
#	}
#});
#test("scope check", function() {
#	deepEqual(this.options, {recipe:"soup",ingredients:["hamster","onions"]}) ;
#});
#test("modify testEnvironment",function() {
#	expect(0);
#	// since we do a shallow copy, the testEnvironment can be modified
#	this.options.ingredients.push("carrots");
#});
#test("testEnvironment reset for next test",function() {
#	deepEqual(this.options, {recipe:"soup",ingredients:["hamster","onions","carrots"]}, "Is this a bug or a feature? Could do a deep copy") ;
#});
#
#
#module("testEnvironment tests");
#
#function makeurl() {
#	var testEnv = QUnit.current_testEnvironment;
#	var url = testEnv.url || 'http://example.com/search';
#	var q   = testEnv.q   || 'a search test';
#	return url + '?q='+encodeURIComponent(q);
#}
#
#test("makeurl working",function() {
#	equal( QUnit.current_testEnvironment, this, 'The current testEnvironment is global');
#	equal( makeurl(), 'http://example.com/search?q=a%20search%20test', 'makeurl returns a default url if nothing specified in the testEnvironment');
#});
#
#module("testEnvironment with makeurl settings", {
#	url: 'http://google.com/',
#	q: 'another_search_test'
#});
#test("makeurl working with settings from testEnvironment", function() {
#	equal( makeurl(), 'http://google.com/?q=another_search_test', 'rather than passing arguments, we use test metadata to from the url');
#});
#
#module("jsDump");
#test("jsDump output", function() {
#	equal( QUnit.jsDump.parse([1, 2]), "[\n  1,\n  2\n]" );
#	equal( QUnit.jsDump.parse({top: 5, left: 0}), "{\n  \"left\": 0,\n  \"top\": 5\n}" );
#	if (typeof document !== 'undefined' && document.getElementById("qunit-header")) {
#		equal( QUnit.jsDump.parse(document.getElementById("qunit-header")), "<h1 id=\"qunit-header\"></h1>" );
#		equal( QUnit.jsDump.parse(document.getElementsByTagName("h1")), "[\n  <h1 id=\"qunit-header\"></h1>\n]" );
#	}
#});
#
#module("assertions");
#test("raises",function() {
#	function CustomError( message ) {
#		this.message = message;
#	}
#
#	CustomError.prototype.toString = function() {
#		return this.message;
#	};
#
#	raises(
#		function() {
#			throw "error"
#		}
#	);
#
#	raises(
#		function() {
#			throw "error"
#		},
#		'raises with just a message, no expected'
#	);
#
#	raises(
#		function() {
#			throw new CustomError();
#		},
#		CustomError,
#		'raised error is an instance of CustomError'
#	);
#
#	raises(
#		function() {
#			throw new CustomError("some error description");
#		},
#		/description/,
#		"raised error message contains 'description'"
#	);
#
#	raises(
#		function() {
#			throw new CustomError("some error description");
#		},
#		function( err ) {
#			if ( (err instanceof CustomError) && /description/.test(err) ) {
#				return true;
#			}
#		},
#		"custom validation function"
#	);
#
#    this.CustomError = CustomError;
#
#    raises(
#        function() {
#            throw new this.CustomError("some error description");
#        },
#        /description/,
#        "raised error with 'this' context"
#    );
#
#});
#
#if (typeof document !== "undefined") {
#
#module("fixture");
#test("setup", function() {
#	expect(0);
#	document.getElementById("qunit-fixture").innerHTML = "foobar";
#});
#test("basics", function() {
#	equal( document.getElementById("qunit-fixture").innerHTML, "test markup", "automatically reset" );
#});
#
#test("running test name displayed", function() {
#	expect(2);
#
#	var displaying = document.getElementById("qunit-testresult");
#
#	ok( /running test name displayed/.test(displaying.innerHTML), "Expect test name to be found in displayed text" );
#	ok( /fixture/.test(displaying.innerHTML), "Expect module name to be found in displayed text" );
#});
#
#}
#
#module("custom assertions");
#(function() {
#	function mod2(value, expected, message) {
#		var actual = value % 2;
#		QUnit.push(actual == expected, actual, expected, message);
#	}
#	test("mod2", function() {
#		mod2(2, 0, "2 % 2 == 0");
#		mod2(3, 1, "3 % 2 == 1");
#	});
#})();
#
#
#module("recursions");
#
#function Wrap(x) {
#	this.wrap = x;
#	if (x == undefined)  this.first = true;
#}
#
#function chainwrap(depth, first, prev) {
#	depth = depth || 0;
#	var last = prev || new Wrap();
#	first = first || last;
#
#	if (depth == 1) {
#		first.wrap = last;
#	}
#	if (depth > 1) {
#		last = chainwrap(depth-1, first, new Wrap(last));
#	}
#
#	return last;
#}
#
#test("check jsDump recursion", function() {
#	expect(4);
#
#	var noref = chainwrap(0);
#	var nodump = QUnit.jsDump.parse(noref);
#	equal(nodump, '{\n  "first": true,\n  "wrap": undefined\n}');
#
#	var selfref = chainwrap(1);
#	var selfdump = QUnit.jsDump.parse(selfref);
#	equal(selfdump, '{\n  "first": true,\n  "wrap": recursion(-1)\n}');
#
#	var parentref = chainwrap(2);
#	var parentdump = QUnit.jsDump.parse(parentref);
#	equal(parentdump, '{\n  "wrap": {\n    "first": true,\n    "wrap": recursion(-2)\n  }\n}');
#
#	var circref = chainwrap(10);
#	var circdump = QUnit.jsDump.parse(circref);
#	ok(new RegExp("recursion\\(-10\\)").test(circdump), "(" +circdump + ") should show -10 recursion level");
#});
#
#test("check (deep-)equal recursion", function() {
#	var noRecursion = chainwrap(0);
#	equal(noRecursion, noRecursion, "I should be equal to me.");
#	deepEqual(noRecursion, noRecursion, "... and so in depth.");
#
#	var selfref = chainwrap(1);
#	equal(selfref, selfref, "Even so if I nest myself.");
#	deepEqual(selfref, selfref, "... into the depth.");
#
#	var circref = chainwrap(10);
#	equal(circref, circref, "Or hide that through some levels of indirection.");
#	deepEqual(circref, circref, "... and checked on all levels!");
#});
#
#
#test('Circular reference with arrays', function() {
#
#	// pure array self-ref
#	var arr = [];
#	arr.push(arr);
#
#	var arrdump = QUnit.jsDump.parse(arr);
#
#	equal(arrdump, '[\n  recursion(-1)\n]');
#	equal(arr, arr[0], 'no endless stack when trying to dump arrays with circular ref');
#
#
#	// mix obj-arr circular ref
#	var obj = {};
#	var childarr = [obj];
#	obj.childarr = childarr;
#
#	var objdump = QUnit.jsDump.parse(obj);
#	var childarrdump = QUnit.jsDump.parse(childarr);
#
#	equal(objdump, '{\n  "childarr": [\n    recursion(-2)\n  ]\n}');
#	equal(childarrdump, '[\n  {\n    "childarr": recursion(-2)\n  }\n]');
#
#	equal(obj.childarr, childarr, 'no endless stack when trying to dump array/object mix with circular ref');
#	equal(childarr[0], obj, 'no endless stack when trying to dump array/object mix with circular ref');
#
#});
#
#
#test('Circular reference - test reported by soniciq in #105', function() {
#	var MyObject = function() {};
#	MyObject.prototype.parent = function(obj) {
#		if (obj === undefined) { return this._parent; }
#		this._parent = obj;
#	};
#	MyObject.prototype.children = function(obj) {
#		if (obj === undefined) { return this._children; }
#		this._children = obj;
#	};
#
#	var a = new MyObject(),
#		b = new MyObject();
#
#	var barr = [b];
#	a.children(barr);
#	b.parent(a);
#
#	equal(a.children(), barr);
#	deepEqual(a.children(), [b]);
#});
#
#
#
#
#(function() {
#	var reset = QUnit.reset;
#	function afterTest() {
#		ok( false, "reset should not modify test status" );
#	}
#	module("reset");
#	test("reset runs assertions", function() {
#		expect(0);
#		QUnit.reset = function() {
#			afterTest();
#			reset.apply( this, arguments );
#		};
#	});
#	test("reset runs assertions2", function() {
#		expect(0);
#		QUnit.reset = reset;
#	});
#})();
#
#if (typeof setTimeout !== 'undefined') {
#function testAfterDone(){
#	var testName = "ensure has correct number of assertions";
#
#	function secondAfterDoneTest(){
#		QUnit.config.done = [];
#		//QUnit.done = function(){};
#		//because when this does happen, the assertion count parameter doesn't actually
#		//work we use this test to check the assertion count.
#		module("check previous test's assertion counts");
#		test('count previous two test\'s assertions', function(){
#			var spans = document.getElementsByTagName('span'),
#			tests = [],
#			countNodes;
#
#			//find these two tests
#			for (var i = 0; i < spans.length; i++) {
#				if (spans[i].innerHTML.indexOf(testName) !== -1) {
#					tests.push(spans[i]);
#				}
#			}
#
#			//walk dom to counts
#			countNodes = tests[0].nextSibling.nextSibling.getElementsByTagName('b');
#			equal(countNodes[1].innerHTML, "99");
#			countNodes = tests[1].nextSibling.nextSibling.getElementsByTagName('b');
#			equal(countNodes[1].innerHTML, "99");
#		});
#	}
#	QUnit.config.done = [];
#	QUnit.done(secondAfterDoneTest);
#
#	module("Synchronous test after load of page");
#
#	asyncTest('Async test', function(){
#		start();
#		for (var i = 1; i < 100; i++) {
#			ok(i);
#		}
#	});
#
#	test(testName, 99, function(){
#		for (var i = 1; i < 100; i++) {
#			ok(i);
#		}
#	});
#
#	//we need two of these types of tests in order to ensure that assertions
#	//don't move between tests.
#	test(testName + ' 2', 99, function(){
#		for (var i = 1; i < 100; i++) {
#			ok(i);
#		}
#	});
#
#
#}
#
#QUnit.done(testAfterDone);
#
#}
