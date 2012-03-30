/**
 * sass
 * sass: http://sass-lang.com/
 */
module.exports = function(grunt){
  
  var log = grunt.log;

  // Nodejs libs.
  var proc = require('child_process');

  grunt.registerMultiTask('sass', 'sass compile', function() {
    var done = this.async();
    var src = this.file.src;
    var dest = this.file.dest;
    var command = 'sass ' + src + ' ' + dest;
    proc.exec(command, function(err, sout, serr){
      if(serr.indexOf('error')>-1){
        proc.exec("growlnotify -t 'SASS COMPILE ERROR!!!' -m '" + serr + "'");
        log.writeln('File ' + dest + ' failed.');
        done(false);
      }else{
        log.writeln('File ' + dest + ' created.');
        done(true);
      }
    });
  });

};
