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

  $.LazyJaxDavis.configure [
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/'
      fetchstart: ->
        log 'index.html fetchstart'
      fetchend: ->
        log 'index.html fetchend'
      afterrefresh: ->
        log 'index.html afterrefresh'
      fetchfail: ->
        log 'index.html fetchfail'
    }
    {
      path: '/jQuery.LazyJaxDavis/demos/applied/1.html'
      fetchstart: ->
        log '1.html fetchstart'
      fetchend: ->
        log '1.html fetchend'
      afterrefresh: ->
        log '1.html afterrefresh'
      fetchfail: ->
        log '1.html fetchfail'
    }
  ],
    root: $('#lazyjaxdavis-root')
    everyfetchstart: ->
      log 'everyfetchstart'
      loading.show()
    everyfetchend: ->
      log 'everyfetchend'
      loading.hide()
    everybeforerefresh: ->
      log 'everybeforerefresh'
    everyafterrefresh: ($root) ->
      log 'everyafterrefresh'
      $root.hide().fadeIn()
    everyfetchfail: ->
      log 'everyfetchfail'
)

