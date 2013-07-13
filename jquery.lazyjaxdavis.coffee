(($, window, document) -> # encapsulate whole start
  
  ns = {}
  $document = $(document)

  # ============================================================
  # tiny utils

  # setTimeout wrapper

  wait = ns.wait = (time) ->
    $.Deferred (defer) ->
      setTimeout ->
        defer.resolve()
      , time
  
  # detect features

  $.support.pushstate = $.isFunction window.history.pushState

  
  # ============================================================
  # string manipulators

  # "#foobar" -> true
  # "foobar"  -> false

  ns.isToId = (path) ->
    if (path.charAt 0) is '#'
      return true
    else
      return false

  # "hogehoge#foobar" -> hogehoge

  ns.trimAnchor = (str) ->
    str.replace /#.*/, ''

  # "page.html?foo=bar" -> "page.html"

  ns.trimGetVals = (path) ->
    path.replace /\?.*/, ''
    
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
  #
  # "<title>foobar</title>", /<title[^>]*>([^<]*)<\/title>/
  # -> "foobar"
  #
  # '<img src="foobar.gif"> <img src="moomoo.png">', /src="([^"]+)"/gi, true
  # -> [ "foobar.gif", "moomoo.png" ]

  ns.filterStr = (str, expr, captureAll) ->
    if captureAll
      res = []
      str.replace expr, (matched, captured) ->
        res.push captured
      return res
    else
      res = str.match expr
      if res and res[1]
        return $.trim res[1]
      else
        return null


  # ============================================================
  # logger
  # prepare this if there's Davis. else do nothing about this
  
  ns.logger = if window.Davis then (new Davis.logger).logger else null

  # shortcuts
  
  ns.info = info = (msg) ->
    if not ns.logger then return
    ns.logger.info msg

  ns.error = error = (msg) ->
    if not ns.logger then return
    ns.logger.error msg


  # ============================================================
  # ajax callers

  ns.fetchPage = (->
    current = null
    (url, options) ->
      ret = $.Deferred (defer) ->
        current.abort() if current?.abort?
        defaults = { url: url }
        options = $.extend defaults, options
        current = ($.ajax options)
        current.then (res) ->
          current = null
          defer.resolve res
        , (xhr, msg) ->
          aborted = (msg is 'abort')
          defer.reject aborted
      .promise()
      ret.abort = -> current?.abort?()
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
      # push first page
      @_items.push (ns.trimAnchor location.pathname)
    push: (obj) ->
      @_items.push obj
      @
    last: ->
      l = @_items.length
      return if l then @_items[l-1] else null
    isToSamePageRequst: (path) ->
      path = (ns.trimAnchor path)
      last = (ns.trimAnchor @last())
      if not last then return false
      if path is last
        return true
      else
        return false
    size: ->
      @_items.length

  
  class ns.Page extends ns.Event

    eventNames = [
      'fetchstart'
      'fetchsuccess'
      'fetchabort'
      'fetchfail'
      'pageready'
      'anchorhandler'
    ]

    options:
      ajxoptions:
        dataType: 'text'
        cache: true
      expr: null
      updatetitle: true
      title: null

    router: null
    config: null
    _text: null

    constructor: (@request, config, @routed, @router, options, @hash) ->

      super

      @config = $.extend {}, @config, config
      @options = $.extend true, {}, @options, options
      if ($.type @config.path) is 'string'
        @path = @config.path
      else
        @path = @request.path

      $.each eventNames, (i, eventName) =>
        $.each @config, (key, val) =>
          if eventName isnt key then return true
          @bind eventName, val

      anchorhandler = @config?.anchorhandler or @options?.anchorhandler
      if anchorhandler then @_anchorhandler = anchorhandler
      @bind 'pageready', =>
        if not @hash then return
        @_anchorhandler.call @, @hash

    _anchorhandler: (hash) ->
      if not hash then return @
      top = ($document.find hash).offset().top
      window.scrollTo 0, top
      @

    fetch: ->

      currentFetch = null
      path = @request.path

      # prepare ajax options
      o = @options?.ajaxoptions or {}
      if @config?.method
        o.type = @config.method
      if @request?.params
        o.data = $.extend true, {}, o.data, @request.params

      @_fetchDefer = $.Deferred (defer) =>
        currentFetch = (ns.fetchPage path, o)
        currentFetch.then (text) =>
          @_text = text
          @updatetitle()
          defer.resolve()
        , (aborted) =>
          defer.reject
            aborted: aborted
        .always =>
          @_fetchDefer = null

      @_fetchDefer.abort = -> currentFetch.abort()
      @_fetchDefer
    
    abort: ->
      @_fetchDefer?.abort()
      @

    rip: (exprKey, captureAll) ->
      if not @_text then return null
      if not exprKey then return @_text
      expr = @options?.expr?[exprKey]
      if not expr then return null
      res = ns.filterStr @_text, expr, captureAll
      if not res
        error "ripper could not find the text for key: #{exprKey}"
      res

    ripAll: (exprKey) ->
      @rip exprKey, true

    updatetitle: ->
      if not @options.updatetitle then return @
      title = null
      if not title and @_text
        title = @rip('title')
      if not title then return @
      document.title = title
      @


  class ns.Router extends ns.Event

    options:
      ajaxoptions:
        dataType: 'text'
        cache: true
        type: 'GET'
      expr:
        title: /<title[^>]*>([^<]*)<\/title>/
        content: /<!-- LazyJaxDavis start -->([\s\S]*)<!-- LazyJaxDavis end -->/
      davis:
        linkSelector: 'a:not([href^=#]):not(.apply-nolazy)'
        formSelector: 'form:not(.apply-nolazy)'
        throwErrors: false
        handleRouteNotFound: true
      minwaittime: 0
      updatetitle: true
      firereadyonstart: true
      ignoregetvals: false

    constructor: (initializer) ->

      super
      @history = new ns.HistoryLogger
      initializer.call @, @

      if @options.davis then @_setupDavis()
      @firePageready not @options.firereadyonstart
      @fireTransPageready()

    _createPage: (request, config, routed, hash) ->

      # prepare option for Page
      o =
        expr: @options.expr
        updatetitle: @options.updatetitle

      # handle anchorhandler
      if @options.anchorhandler
        o.anchorhandler = @options.anchorhandler

      # handle ajaxoptions
      # use config or @options
      if config?.ajaxoptions
        o.ajaxoptions = config.ajaxoptions
      else if @options.ajaxoptions
        o.ajaxoptions = @options.ajaxoptions

      # detect hash
      if not hash and request?.path
        res = ns.tryParseAnotherPageAnchor request.path
        hash = res.hash or null

      new ns.Page request, config, routed, @, o, hash

    _setupDavis: ->

      if not $.support.pushstate then return # you can't use it
      self = @ # Davis needs "this" scope

      # complete action
      completePage = (page) ->
        page.bind 'pageready', ->
          self._findWhosePathMatches 'page', page.path # just find for raise error
          self.trigger 'everypageready'
          self.fireTransPageready()
        self.history.push page.path
        self.fetch page

      # start Davis initialization
      @davis = new Davis ->

        davis = @

        # handle @pages
        if self.pages
          $.each self.pages, (i, pageConfig) ->
            # make davis treat pages which was
            # attached pageexpr as, routeNoutFound.
            if $.type(pageConfig.path) is 'regexp' then return
            method = (pageConfig.method or 'get').toLowerCase()
            davis[method] pageConfig.path, (request) ->
              if self.history.isToSamePageRequst request.path then return
              page = self._createPage request, pageConfig, true
              completePage page
            true

        # handle routNotFound
        if self.options.davis.handleRouteNotFound
          davis.bind 'routeNotFound', (request) ->
            
            # if it was just an anchor to the same page, ignore it
            if ns.isToId request.path
              self.trigger 'toid', request.path
              return

            # check whether the request was another page with anchor.
            # If was anchored, there may be config in @pages
            res = ns.tryParseAnotherPageAnchor request.path
            hash = res.hash or null
            path = res.path or request.path

            # log
            if self.history.isToSamePageRequst path then return

            # find matched page config
            config = (self._findWhosePathMatches 'page', path) or null
            routed = if config then true else false

            # then complete it
            page = self._createPage request, config, routed, hash
            completePage page

        # configure davis
        davis.configure (config) =>
          $.each self.options.davis, (key, val) ->
            config[key] = val
            true

      # if extra davisRoutings were there, do it
      self.davisInitializer?.call davis

      @_tweakDavis()

      @

    _tweakDavis: ->

      # tweak davis not to log erro if routeNotFound.
      # because we treat it as sure thing.
      warn = @davis.logger.warn
      info = @davis.logger.info
      @davis.logger.warn = (args...) =>
        if (args[0].indexOf 'routeNotFound') isnt -1
          args[0] = args[0].replace /routeNotFound/, 'unRouted'
          info.apply @davis.logger, args
        else
          warn.apply @davis.logger, args
      @

    _findWhosePathMatches: (target, requestedPath, handleMulti) ->

      # determine which configs to handle
      if target is 'page'
        if @pages and @pages.length
          configs = @pages
        else
          return null
      else if target is 'transRoutes'
        if @transRoutes and @transRoutes.length
          configs = @transRoutes
          handleMulti = true
        else
          return null

      matched = []
      trimedPath = ns.trimGetVals requestedPath

      # find from configs
      $.each configs, (i, config) =>

        # if ignoregetvals, trim path to eval
        if @options.ignoregetvals or config.ignoregetvals
          path = trimedPath
        else
          path = requestedPath

        # handle regexp
        if $.type(config.path) is 'regexp'
          if config.path.test path
            matched.push config
            if handleMulti then return true
          else
            return true

        # eval path
        if config.path is path
          matched.push config
          if handleMulti then return true

        true

      # raise error if multi configs are detected
      if not handleMulti and (matched.length > 1)
        error "2 or more expr was matched about: #{requestedPath}"
        $.each matched, (i, config) ->
          error "dumps detected page configs - path:#{config.path}"
        return false

      if handleMulti
        return matched
      else
        return matched[0] or null

    fetch: (page) ->

      # invoke all fetch events here.
      # these are not done in Page class because I want these events
      # to be fired in desired order
      $.Deferred (defer) =>
        page.trigger 'fetchstart', page
        @trigger 'everyfetchstart', page
        ($.when page.fetch(), (wait @options.minwaittime)).then =>
          page.trigger 'fetchsuccess', page
          @trigger 'everyfetchsuccess', page
          defer.resolve()
        , (error) =>
          if error.aborted
            page.trigger 'fetchabort', page
            @trigger 'everyfetchabort', page
          else
            page.trigger 'fetchfil', page
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

    # fire all pageready events from @pages
    firePageready: (skipEvery) ->
      if @pages?.length
        page = @_findWhosePathMatches 'page', location.pathname
        if page then page.pageready?()
      if skipEvery then return @
      @trigger 'everypageready'
      @

    # fire all pageready events from @transRoutes
    fireTransPageready: ->
      if @transRoutes?.length
        routings = @_findWhosePathMatches 'transRoutes', location.pathname
        if not routings.length then return @
        $.each routings, (i, routing) ->
          routing.pageready?()
      @

    # initialization helpers
    route: (pages) ->
      @pages = pages
      @
    routeTransparents: (transRoutes) ->
      @transRoutes = transRoutes
      @
    routeDavis: (initializer) ->
      @davisInitializer = initializer
      @
    option: (options) ->
      if not options then return @options
      @options = $.extend true, {}, @options, options


  # ============================================================
  
  # globalify

  $.LazyJaxDavisNs = ns
  $.LazyJaxDavis = ns.Router


) jQuery, @, @document # encapsulate whole end
