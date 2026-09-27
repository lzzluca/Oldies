module.exports = function(grunt) {

  grunt.initConfig({
    browserify: {
      dev: {
        src: ["./components/*/*.html"],
        dest: "./public/ciao",
        options: {
          transform: ["aliasify"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.registerTask("default", ["browserify:dev"]);
};

/*
  var aliasify = require('aliasify').configure({
    aliases: {
      "components": "./components"
    },
    verbose: false
  });

  var b = require("browserify").configure({
    src: ["./components/* /*.html"],
    dest: "./public/ciao",
    options: {
      transform: ["aliasify"]
    }
  });
  b.transform(aliasify);
*/
 var aliasify = require('aliasify').configure({
    aliases: {
      "components": "./components"
    },
    verbose: false
  });

  var b = require("browserify").configure({
    src: ["./components/* /*.html"],
    dest: "./public/ciao"
  });

b.transform(function (file) {
    var data = '';
    return through(write, end);
    
    function write (buf) { data += buf }
    function end () {
        this.queue(coffee.compile(data));
        this.queue(null);
    }
});

