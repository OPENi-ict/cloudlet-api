'use strict';

module.exports = function(grunt) {

    var lib         = 'lib/**/*.js';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [lib],
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default',  ['jshint' ]);

};
