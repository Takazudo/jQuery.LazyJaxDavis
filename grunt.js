/**
 * grunt
 * This file is build config for grunt.
 * Don't load this to your html.
 * grunt: https://github.com/cowboy/grunt
 */
module.exports = function(grunt){

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        ' <%= grunt.template.today("m/d/yyyy") %>\n' +
        ' <%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      lajax: {
        src: [ '<banner:meta.banner>', '<config:coffee.lajax.dest>' ],
        dest: '<config:coffee.lajax.dest>'
      }
    },
    uglify: {
      lajax: {
        src: '<config:coffee.lajax.dest>',
        dest: 'jquery.lazyjaxdavis.min.js'
      }
    },
    coffee: {
      lajax: {
        files: [ 'jquery.lazyjaxdavis.coffee' ],
        dest: 'jquery.lazyjaxdavis.js'
      },
      test: {
        files: [ 'tests/qunit/test/test.coffee' ],
        dest: 'tests/qunit/test/test.js'
      }
    },
    sass: {
      doc: {
        src: 'doc_src/common/scss/style.scss',
        dest: 'doc_src/common/css/style.css'
      }
    },
    watch: {
      lajax: {
        files: [ '<config:coffee.lajax.files>' ],
        tasks: 'coffee:lajax concat ok'
      },
      test: {
        files: [ '<config:coffee.test.files>' ],
        tasks: 'coffee:test ok'
      },
      doc: {
        files: [ '<config:sass.doc.src>' ],
        tasks: 'sass:doc ok'
      }
    }
  });

  grunt.loadTasks('gruntTasks');
  grunt.registerTask('default', 'coffee sass concat ok');

};
