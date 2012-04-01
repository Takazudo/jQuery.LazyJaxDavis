/**
 * grunt
 * This compiles coffee to js
 *
 * grunt: https://github.com/cowboy/grunt
 */
module.exports = function(grunt){

  grunt.initConfig({
    pkg: '<json:info.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        ' <%= grunt.template.today("m/d/yyyy") %>\n' +
        ' <%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      '../jquery.lazyjaxdavis.js': [ '<banner>', '../jquery.lazyjaxdavis.js' ]
    },
    watch: {
      files: [
        '../jquery.lazyjaxdavis.coffee',
        '../tests/qunit/test/test.coffee',
        '../_sitesrc/common/scss/*.scss'
      ],
      tasks: 'coffee sass concat notifyOK'
    },
    uglify: {
      '../jquery.lazyjaxdavis.min.js': '../jquery.lazyjaxdavis.js'
    },
    coffee: {
      '../jquery.lazyjaxdavis.js': [ '../jquery.lazyjaxdavis.coffee' ],
      '../tests/qunit/test/test.js' : [ '../tests/qunit/test/test.coffee' ]
    },
    sass: {
      '../_sitesrc/common/css/style.css': '../_sitesrc/common/scss/style.scss'
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', 'coffee sass concat notifyOK');

};
