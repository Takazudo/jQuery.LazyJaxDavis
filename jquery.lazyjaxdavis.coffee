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

    constructor: (@request, @config, @routed, @router) ->
      super
      $.each eventNames, (i, eventName) =>
        $.each @config, (key, val) =>
          if eventName isnt key then return true
          @bind eventName, val
      @_eventify_anotherAageAnchor()

    _eventify_anotherAageAnchor: ->
      res = ns.tryParseAnotherPageAnchor @request.path
      if not res?.hash then return @
      @_hash = res.hash
      @bind 'fetchend', =>
        location.href = @_hash
      @

    fetch: ->
      $.Deferred (defer) =>
        @trigger 'fetchstart', @router.$root, @router
        (ns.fetchPage @request.path).then (text) =>
          data =
            wholetext: text
            title: ns.filterStr text, @router.options.exprTitle
            content: ns.filterStr text, @router.options.exprContent
          @trigger 'fetchend', @router.$root, @router, data
          defer.resolve data
        , (aborted) =>
          if not aborted
            @trigger 'fetchfail', @router.$root, @router
          defer.reject
            aborted: aborted


  class ns.Router extends ns.Event

    eventNames = [
      'everyfetchstart'
      'everyfetchend'
      'everybeforerefresh'
      'everyafterrefresh'
      'everyfetchfail'
    ]

    options:
      exprTitle: /<title[^>]*>([^<]*)<\/title>/
      exprContent: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
      linkSelector: 'a:not(.apply-nolazyjax)'
      formSelector: 'form:not(.apply-nolazyjax)'
      throwErrors: false
      handleRouteNotFound: true

    constructor: (pages, options) ->

      # handle instance creation wo new
      if not (@ instanceof arguments.callee)
        return new ns.Router pages, options

      super

      @pages = pages or null
      @options = $.extend {}, @options, options
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

    _setupDavis: ->

      if not $.support.pushstate then return
      self = @ # Davis needs "this" scope

      @davis = new Davis ->
        davis = @
        if not self.pages then return
        $.each self.pages, (i, pageInfo) ->
          davis.get pageInfo.path, (request) ->
            if self.logger.isToSamePageRequst request then return
            page = new ns.Page request, pageInfo, true, self
            self.logger.log page
            self.updateContent page
          true

      if @options.handleRouteNotFound
        @davis.bind 'routeNotFound', (request) =>
          if ns.isToId request.path
            self.trigger 'toid', request.path
            return
          if self.logger.isToSamePageRequst request then return
          page = new ns.Page request, {}, false, self
          self.logger.log page
          self.updateContent page

      @davis.configure (config) =>
        $.each @options, (key, val) ->
          config[key] = val
          true

      @bind 'toid', (hash) =>
        if @options.toid
          @options.toid.call @, request.path
        else
          location.href = hash

      @

    updateContent: (page) ->
      $.Deferred (defer) =>
        @trigger 'everyfetchstart', @$root, @
        page.fetch().then (data) =>
          @trigger 'everyfetchend', @$root, @
          page.trigger 'beforerefresh', @$root, @
          @trigger 'everybeforerefresh', @$root, @
          @$root.html data.content
          page.trigger 'afterrefresh', @$root, @
          @trigger 'everyafterrefresh', @$root, @
          defer.resolve()
        , =>
          @trigger 'everyfetchfail', @$root, @
      .promise()

    destroy: ->
      @davis?.stop()
      @


  # ============================================================
  
  # globalify

  $.LazyJaxDavisNs = ns
  $.LazyJaxDavis = ns.Router


) jQuery, @, @document # encapsulate whole end
