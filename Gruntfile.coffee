module.exports = (grunt) ->
  
  grunt.task.loadTasks 'gruntcomponents/tasks'
  grunt.task.loadNpmTasks 'grunt-contrib-coffee'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'
  grunt.task.loadNpmTasks 'grunt-contrib-sass'

  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')
    banner: """
/*! <%= pkg.name %> (<%= pkg.repository.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 * License: MIT */

"""

    growl:

      ok:
        title: 'COMPLETE!!'
        msg: '＼(^o^)／'

    coffee:

      lajax:
        src: [ 'jquery.lazyjaxdavis.coffee' ]
        dest: 'jquery.lazyjaxdavis.js'

      test:
        src: [ 'tests/qunit/test/test.coffee' ]
        dest: 'tests/qunit/test/test.js'

    sass:

      doc:
        src: 'doc_src/common/scss/style.scss'
        dest: 'doc_src/common/css/style.css'

    concat:

      banner:
        options:
          banner: '<%= banner %>'
        src: [ '<%= coffee.lajax.dest %>' ]
        dest: '<%= coffee.lajax.dest %>'
        
    uglify:

      options:
        banner: '<%= banner %>'
      lajax:
        src: '<%= concat.banner.dest %>'
        dest: 'jquery.lazyjaxdavis.min.js'

    watch:

      lajax:
        files: '<%= coffee.lajax.src %>'
        tasks: [
          'coffee:lajax'
          'concat'
          'uglify'
          'growl:ok'
        ]

      test: 
        files: '<%= coffee.test.src %>'
        tasks: [
          'coffee:test'
          'growl:ok'
        ]

      doc:
        files: '<%= sass.doc.src %>'
        tasks: [
          'sass:doc'
          'growl:ok'
        ]

  grunt.registerTask 'default', [
    'sass'
    'coffee'
    'concat'
    'uglify'
    'growl:ok'
  ]

