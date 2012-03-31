(($, win, doc) -> # encapsulate whole start
  
  ns = {}

  # ============================================================
  # tiny utils

  # setTimeout wrapper

  wait = ns.wait = (time) ->
    $.Deferred (defer) ->
      setTimeout ->
        defer.resolve()
      , time
  
  # detect features

  $.support.pushstate = Davis.supported()

  
  # ============================================================
  # string manipulators

  # "#foobar" -> true
  # "foobar"  -> false

  ns.isToId = (path) ->
    if (path.charAt 0) is '#'
      return true
    else
      return false
    
  # "/somewhere/foo.html#bar" will be parsed to...
  # { path: "/somewhere/foo.html", hash: "#bar" }

  ns.tryParseAnotherPageAnchor = (path) ->
    if ns.isToId(path)
      return false
    if (path.indexOf '#') is -1
      return false
    res = path.match /^([^#]+)#(.+)/
    ret = { path: res[1] }
    if res[2] then ret.hash = "##{res[2]}"
    ret

  # filters html string
  # "<title>foobar</title>", /<title[^>]*>([^<]*)<\/title>/
  # -> "foobar"

  ns.filterStr = (str, expr) ->
    res = str.match expr
    if res and res[1]
      return $.trim res[1]
    else
      return null


  # ============================================================
  # ajax callers

  ns.fetchPage = (->
    current = null
    (url) ->
      ret = $.Deferred (defer) ->
        if current then current.abort()
        options = 
          url: url
          dataType: 'text'
          cache: true
        current = ($.ajax options).then (res) ->
          current = null
          defer.resolve res
        , (xhr, msg) ->
          aborted = (msg is 'abort')
          defer.reject aborted
      .promise()
      ret.abort = -> current?.abort()
      ret
  )()


  # ============================================================
  # event module

  class ns.Event
    constructor: ->
      @_callbacks = {}

    bind: (ev, callback) ->
      evs = ev.split(' ')
      for name in evs
        @_callbacks[name] or= []
        @_callbacks[name].push(callback)
      @

    one: (ev, callback) ->
      @bind ev, ->
        @unbind(ev, arguments.callee)
        callback.apply(@, arguments)

    trigger: (args...) ->
      ev = args.shift()
      list = @_callbacks?[ev]
      return unless list
      for callback in list
        if callback.apply(@, args) is false
          break
      @

    unbind: (ev, callback) ->
      unless ev
        @_callbacks = {}
        return @

      list = @_callbacks?[ev]
      return this unless list

      unless callback
        delete @_callbacks[ev]
        return this

      for cb, i in list when cb is callback
        list = list.slice()
        list.splice(i, 1)
        @_callbacks[ev] = list
        break
      @


  # ============================================================
  # main
  
  class ns.HistoryLogger
    constructor: ->
      @_items = []
    log: (obj) ->
      @_items.push obj
      @
    last: ->
      l = @_items.length
      return if l then @_items[l-1] else null
    isToSamePageRequst: (request) ->
      last = @last()
      if not last then return false
      if request.path is last.request.path
        return true
      else
        return false

  
  class ns.Page extends ns.Event

    eventNames = [
      'fetchstart'
      'fetchend'
      'afterrefresh'
      'fetchfail'
    ]

    router: null

    constructor: (@request, @config, @routed, @router, @_expr) ->
      super
      $.each eventNames, (i, eventName) =>
        $.each @config, (key, val) =>
          if eventName isnt key then return true
          @bind eventName, val
      @_handleAnotherPageAnchor()

    _handleAnotherPageAnchor: ->
      res = ns.tryParseAnotherPageAnchor @request.path
      if not res?.hash
        @path = @request.path
        return @
      @_hash = res.hash
      @path = res.path
      @bind 'fetchend', =>
        location.href = @_hash
      @

    fetch: ->
      $.Deferred (defer) =>
        @trigger 'fetchstart', @
        (ns.fetchPage @request.path).then (text) =>
          @_text = text
          @trigger 'fetchend', @
          defer.resolve()
        , (aborted) =>
          if not aborted
            @trigger 'fetchfail', @
          defer.reject
            aborted: aborted

    rip: (exprKey) ->
      if not @_text then return null
      if not exprKey then return @_text
      ns.filterStr @_text, @_expr[exprKey]


  class ns.Router extends ns.Event

    eventNames = [
      'everyfetchstart'
      'everyfetchend'
      'everybeforerefresh'
      'everyafterrefresh'
      'everyfetchfail'
    ]

    options:
      expr:
        title: /<title[^>]*>([^<]*)<\/title>/
        content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
      davis:
        linkSelector: 'a:not(.apply-nolazyjax)'
        formSelector: 'form:not(.apply-nolazyjax)'
        throwErrors: false
        handleRouteNotFound: true
      minwaittime: 0

    constructor: (pages, options, extraRoute) ->

      # handle instance creation wo new
      if not (@ instanceof arguments.callee)
        return new ns.Router pages, options, extraRoute

      # pages can be skipped
      if not $.isArray(pages)
        extraRoute = options
        options = pages
        pages = null
      @pages = pages

      super

      @extraRoute = extraRoute or $.noop
      @options = $.extend true, {}, @options, options
      @$root = @options.root or null

      @logger = new ns.HistoryLogger
      @_eventify()
      @_setupDavis()

    _eventify: ->
      $.each eventNames, (i, eventName) =>
        $.each @options, (key, val) =>
          if key isnt eventName then return true
          @bind eventName, val
      @

    _createPage: (request, config, routed) ->
      new ns.Page request, config, routed, @, @options.expr

    _setupDavis: ->

      if not $.support.pushstate then return
      self = @ # Davis needs "this" scope

      @davis = new Davis ->
        davis = @
        if not self.pages then return
        $.each self.pages, (i, pageConfig) ->
          davis.get pageConfig.path, (request) ->
            if self.logger.isToSamePageRequst request then return
            page = self._createPage request, pageConfig, true
            self.logger.log page
            self.updateContent page
          true
        self.extraRoute.call davis

      if @options.davis.handleRouteNotFound
        @davis.bind 'routeNotFound', (request) =>
          if ns.isToId request.path
            self.trigger 'toid', request.path
            return
          if self.logger.isToSamePageRequst request then return
          page = self._createPage request, {}, false
          self.logger.log page
          self.updateContent page

      @davis.configure (config) =>
        $.each @options.davis, (key, val) ->
          config[key] = val
          true

      @bind 'toid', (hash) =>
        if @options.toid
          @options.toid.call @, request.path
        else
          location.href = hash

      @_tweakDavis()
      @

    _tweakDavis: ->
      warn = @davis.logger.warn
      info = @davis.logger.info
      @davis.logger.warn = (args...) =>
        if (args[0].indexOf 'routeNotFound') isnt -1
          args[0] = args[0].replace /routeNotFound/, 'unRouted'
          info.apply @davis.logger, args
        else
          warn.apply @davis.logger, args
      @

    updateContent: (page) ->
      $.Deferred (defer) =>
        @trigger 'everyfetchstart', page
        ($.when page.fetch(), (wait @options.minwaittime)).then =>
          @trigger 'everyfetchend', page
          defer.resolve()
        , =>
          @trigger 'everyfetchfail', page
      .promise()

    stop: ->
      @davis?.stop()
      @

    navigate: (path, method) ->
      if @davis
        request = new Davis.Request
          method: method or 'get'
          fullPath: path
          title: ''
        Davis.location.assign request
      else
        location.href = path
      @


  # ============================================================
  
  # globalify

  $.LazyJaxDavisNs = ns
  $.LazyJaxDavis = ns.Router


) jQuery, @, @document # encapsulate whole end
