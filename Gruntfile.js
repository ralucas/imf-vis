/**
 * npm install --save-dev the following (or see the package.json):
 * grunt
 * grunt-contrib-watch
 * time-grunt
 * load-grunt-tasks
 * grunt-bump
 * grunt-mocha-test
 * grunt-jsdoc@beta
 * grunt-contrib-jshint
 * jshint-stylish
 * grunt-notify
 * grunt-contrib-uglify
 * grunt-contrib-imagemin
 * grunt-contrib-cssmin
 * grunt-concurrent
 * grunt-nodemon
 * grunt-node-inspector
 * open
 * blanket
 **/
 
'use strict';

var config = require('./config');
 
module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var clientConfig = config.get('client'); 

  // Project configuration.
  grunt.initConfig({
 
    bump: {
      createTag: true,
      push: true,
      pushTo: 'upstream'
    },
 
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'tests/coverage/blanket',
          grep: grunt.option('grep'),
          colors: true
        },
        src: ['tests/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'tests/coverage/coverage.html'
        },
        src: ['tests/*.js']
      }
    },
 
    jsdoc: {
      dist: {
        src: ['app/*'],
        options: {
          destination: 'docs',
          configure: 'docs/conf.json'
        }
      }
    },
 
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true,
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['app/*']
      }
    },
 
    watch: {
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      }
    },
 
    concurrent: {
      dev: {
        tasks: ['nodemon', 'node-inspector', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
 
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: [],
          env: {
            PORT: '3000'
          },
          cwd: __dirname,
          ignore: ['node_modules/**'],
          watch: ['server', 'client'],
          ext: 'js, json, html'
        }
      }
    },
 
    'node-inspector': {
      custom: {
        options: {
          'web-port': 8080,
          'web-host': '0.0.0.0',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': false,
          'stack-trace-limit': 50,
          'hidden': []
        }
      }
    },

    browserify: {
      vendor: {
        src: [],
        dest: 'public/js/common.js',
        options: {
          require: clientConfig.common.packages,
          ignore: ['system', 'file']
        }
      },
      client: {
        src: ['client/scripts/*.js'],
        dest: 'public/js/index.js',
        options: {
          external: clientConfig.common.packages,
          transform: ['reactify', 'brfs']
        }
      }
    }
 
  });
 
  // Default task.
  grunt.registerTask('default', ['jshint', 'concurrent']);
 
  grunt.registerTask('test', 'mochaTest');
 
  grunt.registerTask('docs', 'jsdoc');
 
};
