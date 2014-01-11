module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		replace: {
			modernSimple: {
				options: {
					patterns: [
						{
							match: 'load',
							replacement: '<%= grunt.file.read("src/javascript/simple.js") %>'
						}, {
							match: 'assets',
							replacement: '<%= grunt.file.read("src/javascript/modern/assets.js") %>'
						}, {
							match: 'apply',
							replacement: '<%= grunt.file.read("src/javascript/modern/apply.js") %>'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/main.js'], dest: 'lib/modern/simple'}
				]
			},
			modernLocalstorage: {
				options: {
					patterns: [
						{
							match: 'load',
							replacement: '<%= grunt.file.read("src/javascript/localstorage.js") %>'
						}, {
							match: 'assets',
							replacement: '<%= grunt.file.read("src/javascript/modern/assets.js") %>'
						}, {
							match: 'apply',
							replacement: '<%= grunt.file.read("src/javascript/modern/apply.js") %>'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/main.js'], dest: 'lib/modern/localstorage'}
				]
			},
			polyfilledSimple: {
				options: {
					patterns: [
						{
							match: 'load',
							replacement: '<%= grunt.file.read("src/javascript/simple.js") %>'
						}, {
							match: 'assets',
							replacement: '<%= grunt.file.read("src/javascript/polyfilled/assets.js") %>'
						}, {
							match: 'apply',
							replacement: '<%= grunt.file.read("src/javascript/polyfilled/apply.js") %>'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/main.js'], dest: 'lib/polyfilled/simple'}
				]
			},
			polyfilledLocalstorage: {
				options: {
					patterns: [
						{
							match: 'load',
							replacement: '<%= grunt.file.read("src/javascript/localstorage.js") %>'
						}, {
							match: 'assets',
							replacement: '<%= grunt.file.read("src/javascript/polyfilled/assets.js") %>'
						}, {
							match: 'apply',
							replacement: '<%= grunt.file.read("src/javascript/polyfilled/apply.js") %>'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/main.js'], dest: 'lib/polyfilled/localstorage'}
				]
			},
			modernSimpleExample: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/simple.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.modern-simple.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/modern/simple'}
				]
			},
			modernLocalstorageExample: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/localstorage.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.modern-localstorage.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/modern/localstorage'}
				]
			},
			polyfilledSimpleExample: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/simple.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.polyfilled-simple.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/polyfilled/simple'}
				]
			},
			polyfilledLocalstorageExample: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/localstorage.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.polyfilled-localstorage.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/polyfilled/localstorage'}
				]
			}
		},
		copy: {
			modernSimple: {
				files: [
					{src: ['lib/modern/simple/main.js'], dest: 'lib/defr.modern-simple.js'}
				]
			},
			modernLocalstorage: {
				files: [
					{src: ['lib/modern/localstorage/main.js'], dest: 'lib/defr.modern-localstorage.js'}
				]
			},
			polyfilledSimple: {
				files: [
					{src: ['lib/polyfilled/simple/main.js'], dest: 'lib/defr.polyfilled-simple.js'}
				]
			},
			polyfilledLocalstorage: {
				files: [
					{src: ['lib/polyfilled/localstorage/main.js'], dest: 'lib/defr.polyfilled-localstorage.js'}
				]
			},
			modernSimpleExample: {
				files: [
					{src: ['lib/modern/simple/index.html'], dest: 'example/modern-simple.html'}
				]
			},
			modernLocalstorageExample: {
				files: [
					{src: ['lib/modern/localstorage/index.html'], dest: 'example/modern-localstorage.html'}
				]
			},
			polyfilledSimpleExample: {
				files: [
					{src: ['lib/polyfilled/simple/index.html'], dest: 'example/polyfilled-simple.html'}
				]
			},
			polyfilledLocalstorageExample: {
				files: [
					{src: ['lib/polyfilled/localstorage/index.html'], dest: 'example/polyfilled-localstorage.html'}
				]
			}
		},
		clean: {
			modernSimple: ['lib/modern'],
			modernLocalstorage: ['lib/modern'],
			polyfilledSimple: ['lib/polyfilled'],
			polyfilledLocalstorage: ['lib/polyfilled']
		},
		uglify : {
			modernSimple : {
				src : 'lib/modern/simple/main.js',
				dest : 'lib/defr.modern-simple.min.js'
			},
			modernLocalstorage : {
				src : 'lib/modern/localstorage/main.js',
				dest : 'lib/defr.modern-localstorage.min.js'
			},
			polyfilledSimple : {
				src : 'lib/polyfilled/simple/main.js',
				dest : 'lib/defr.polyfilled-simple.min.js'
			},
			polyfilledLocalstorage : {
				src : 'lib/polyfilled/localstorage/main.js',
				dest : 'lib/defr.polyfilled-localstorage.min.js'
			}
		},
		watch : {
			modernSimple : {
				files : ['src/javascript/main.js', 'src/javascript/simple.js', 'src/javascript/modern/assets.js', 'src/javascript/modern/apply.js'],
				tasks : ['modern-simple'],
				options : {
					spawn : false
				}
			},
			modernLocalstorage : {
				files : ['src/javascript/main.js', 'src/javascript/localstorage.js', 'src/javascript/modern/assets.js', 'src/javascript/modern/apply.js'],
				tasks : ['modern-localstorage'],
				options : {
					spawn : false
				}
			},
			polyfilledSimple : {
				files : ['src/javascript/main.js', 'src/javascript/simple.js', 'src/javascript/polyfilled/assets.js', 'src/javascript/polyfilled/apply.js'],
				tasks : ['polyfilled-simple'],
				options : {
					spawn : false
				}
			},
			polyfilledLocalstorage : {
				files : ['src/javascript/main.js', 'src/javascript/localstorage.js', 'src/javascript/polyfilled/assets.js', 'src/javascript/polyfilled/apply.js'],
				tasks : ['polyfilled-localstorage'],
				options : {
					spawn : false
				}
			},
			simpleExample : {
				files : ['src/html/index.html', 'src/html/simple.html'],
				tasks : ['modern-simple-example', 'polyfilled-simple-example'],
				options : {
					spawn : false
				}
			},
			localstorageExample : {
				files : ['src/html/index.html', 'src/html/localstorage.html'],
				tasks : ['modern-localstorage-example', 'polyfilled-localstorage-example'],
				options : {
					spawn : false
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('modern-simple', ['replace:modernSimple', 'uglify:modernSimple', 'copy:modernSimple', 'clean:modernSimple']);
	grunt.registerTask('modern-simple-example', ['replace:modernSimpleExample', 'copy:modernSimpleExample', 'clean:modernSimple']);
	grunt.registerTask('modern-localstorage', ['replace:modernLocalstorage', 'uglify:modernLocalstorage', 'copy:modernLocalstorage', 'clean:modernLocalstorage']);
	grunt.registerTask('modern-localstorage-example', ['replace:modernLocalstorageExample', 'copy:modernLocalstorageExample', 'clean:modernLocalstorage']);
	grunt.registerTask('polyfilled-simple', ['replace:polyfilledSimple', 'uglify:polyfilledSimple', 'copy:polyfilledSimple', 'clean:polyfilledSimple']);
	grunt.registerTask('polyfilled-simple-example', ['replace:polyfilledSimpleExample', 'copy:polyfilledSimpleExample', 'clean:polyfilledSimple']);
	grunt.registerTask('polyfilled-localstorage', ['replace:polyfilledLocalstorage', 'uglify:polyfilledLocalstorage', 'copy:polyfilledLocalstorage', 'clean:polyfilledLocalstorage']);
	grunt.registerTask('polyfilled-localstorage-example', ['replace:polyfilledLocalstorageExample', 'copy:polyfilledLocalstorageExample', 'clean:polyfilledLocalstorage']);
	grunt.registerTask('default', ['modern-simple', 'modern-localstorage', 'polyfilled-simple', 'polyfilled-localstorage', 'modern-simple-example', 'modern-localstorage-example', 'polyfilled-simple-example', 'polyfilled-localstorage-example']);
}