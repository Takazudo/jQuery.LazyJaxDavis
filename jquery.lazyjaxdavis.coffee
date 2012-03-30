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

  ns.isToId = (path) ->
    if (path.charAt 0) is '#'
      return true
    else
      return false
    
  ns.tryParseAnotherPageAnchor = (path) ->
    if ns.isToId(path)
      return false
    if (path.indexOf '#') is -1
      return false
    res = path.match /^([^#]+)#(.+)/
    ret = { path: res[0] }
    if res[2] then ret.hash = "#{res[2]}"
    ret

  ns.fetchPageContent = (->
    current = null
    (url) ->
      $.Deferred (defer) ->
        if current then current.abort()
        current = $.ajax
          url: url
          dataType: 'text'
          cache: true
        .then (res) ->
          current = null
          content = ns.filterContent(res)
          defer.resolve content
        , (jqXHR, msg) ->
          defer.reject "something wrong or aborted.", (msg is 'abort')
      .promise()
  )()
  
  ns.filterContent = (pagestr) ->
    started = false
    res = []
    ret = {}
    title = null
    $.each (pagestr.split '\n'), (i, line) ->
      if title is null
        if /^<title>/.test line
          ret.title = (line.match /^<title>([^<]*)/)[1]
      if line is '<!-- LazyJaxDavis start -->'
        started = true
        return
      if line is '<!-- LazyJaxDavis end -->'
        ret.html = res.join '\n'
        return false
      if started then res.push line
    ret


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
  
  # ============================================================

  class ns.HistoryLogger
    constructor: ->
      @_items = []
    log: (obj) ->
      @_items.push obj
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

    constructor: (@request, @config, @routed) ->
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
        (ns.fetchPageContent @request.path).then (content) =>
          @trigger 'fetchend', @router.$root, @router
          defer.resolve content
        , (msg, aborted) =>
          if not aborted
            @trigger 'fetchfail', @router.$root, @router
          defer.reject
            msg: msg
            aborted: aborted


  class ns.Router extends ns.Event

    eventNames = [
      'everyfetchstart'
      'everyfetchend'
      'everybeforerefresh'
      'everyafterrefresh'
      'everyfetchfail'
    ]

    constructor: (@pages, @options) ->
      super
      @logger = new ns.HistoryLogger
      @options = $.extend
        linkSelector: 'a:not(.apply-nolazyjax)'
        formSelector: 'form:not(.apply-nolazyjax)'
        throwErrors: false
        handleRouteNotFound: true
      , @options
      @$root = $(@options.root)
      if not @$root.size() then return
      @_eventify()
      @_setupDavis()

    _eventify: ->
      $.each eventNames, (i, eventName) =>
        $.each @options, (key, val) =>
          if key isnt eventName then return true
          @bind eventName, val
      @

    _setupDavis: ->
      self = @ # Davis needs "this" scope
      if not Modernizr.history then return
      @davis = new Davis ->
        davis = @
        $.each self.pages, (i, pageInfo) ->
          davis.get pageInfo.path, (request) ->
            if self.logger.isToSamePageRequst request then return
            page = new ns.Page request, pageInfo, true
            page.router = self
            self.logger.log page
            self.updateContent page
          true
      @davis.bind 'routeNotFound', (request) =>
        if ns.isToId request.path
          self.trigger 'toid', request.path
          return
        if self.logger.isToSamePageRequst request then return
        page = new ns.Page request, {}, false
        page.router = self
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
        page.fetch().then (content) =>
          @trigger 'everyfetchend', @$root, @
          page.trigger 'beforerefresh', @$root, @
          @trigger 'everybeforerefresh', @$root, @
          @$root.html content.html
          page.trigger 'afterrefresh', @$root, @
          @trigger 'everyafterrefresh', @$root, @
          defer.resolve()
        , =>
          @trigger 'everyfetchfail', @$root, @
      .promise()



  ns.configure = (config, options) ->
    ns.router = new ns.Router config, options 

  # globalify

  $.LazyJaxDavis = ns

) jQuery, @, @document # encapsulate whole end
