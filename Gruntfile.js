module.exports = function(grunt) {

	// 1. All configuration goes here
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		/*
		concat : {
			example : {
				src : ['fileadmin/templates/js/src-head-inline/*.js'],
				dest : 'fileadmin/templates/js/jkphl-head-inline.js'
			}
		},
		*/

		uglify : {
			minimal : {
				src : 'lib/defr.js',
				dest : 'lib/defr.min.js'
			}
		},

		watch : {
			javascript : {
				files : ['lib/*.js'],
				tasks : ['uglify'],
				options : {
					spawn : false
				}
			}
		}

	});

	// 3. Where we tell Grunt we plan to use this plug-in.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	// require('load-grunt-tasks')(grunt);

	// 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
	grunt.registerTask('default', [/*'concat', */'uglify']);

}