jQuery(($) ->

  # debugger
  
  class Logger
    constructor: ->
      @$el = $('<div id="logger"></div>')
      $('body').append @$el
    items: []
    log: (msg) ->
      $item = $("<div>#{msg}</div>")
      @$el.prepend $item
      @items.push $item
      setTimeout =>
        $item.remove()
      , 4000
      if @items.length > 30
        @items[0].remove()
      @
  
  logger = new Logger
  log = (args...) -> logger.log.apply logger, args

  # loading
  
  class Loading
    constructor: ->
      @$el = $('<div id="loading">Loading...</div>').hide()
      $('body').append @$el
    show: ->
      @$el.show()
      @
    hide: ->
      @$el.hide()
      @

  loading = new Loading

  # configure Router

  $root = $('#lazyjaxdavis-root')

  window.jaxdavis = $.LazyJaxDavis [
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/'
      fetchstart: ->
        log 'index.html fetchstart'
      fetchend: ->
        log 'index.html fetchend'
    }
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/1.html'
      fetchstart: ->
        log '1.html fetchstart'
      fetchend: ->
        log '1.html fetchend'
    }
  ],
    everyfetchstart: ->
      log 'everyfetchstart'
      loading.show()
    everyfetchend: (page) ->
      log 'everyfetchend'
      loading.hide()
      $root.html page.rip 'content'
    everyfetchfail: ->
      log 'everyfetchfail'
  , ->
    @get '/jQuery.LazyJaxDavis/demos/applied/2.html', (req) ->
        console.log 'davis routing applied'


)

