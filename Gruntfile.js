module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		replace: {
			simple: {
				options: {
					patterns: [
						{
							match: 'localstorage',
							replacement: ''
						}, {
							match: 'select',
							replacement: '<%= grunt.file.read("src/javascript/defr.select.modern.js") %>'
						}, {
							match: 'queryselector',
							replacement: '\'noscript[itemtype="http://defr.jkphl.is/assets"],noscript.defr\''
						}, {
							match: 'append',
							replacement: 'load'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/defr.main.js'], dest: 'lib/simple'}
				]
			},
			simplePolyfilled: {
				options: {
					patterns: [
						{
							match: 'localstorage',
							replacement: ''
						}, {
							match: 'select',
							replacement: '<%= grunt.file.read("src/javascript/defr.select.polyfilled.js") %>'
						}, {
							match: 'queryselector',
							replacement: '{itemtype: \'http://defr.jkphl.is/assets\', className: \'defr\'}'
						}, {
							match: 'append',
							replacement: 'load'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/defr.main.js'], dest: 'lib/simple-polyfilled'}
				]
			},
			localstorage: {
				options: {
					patterns: [
						{
							match: 'localstorage',
							replacement: '<%= grunt.file.read("src/javascript/defr.load.localstorage.js") %>'
						}, {
							match: 'select',
							replacement: '<%= grunt.file.read("src/javascript/defr.select.modern.js") %>'
						}, {
							match: 'queryselector',
							replacement: '\'noscript[itemtype="http://defr.jkphl.is/assets"],noscript.defr\''
						}, {
							match: 'append',
							replacement: 'append'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/defr.main.js'], dest: 'lib/localstorage'}
				]
			},
			localstoragePolyfilled: {
				options: {
					patterns: [
						{
							match: 'localstorage',
							replacement: '<%= grunt.file.read("src/javascript/defr.load.localstorage.js") %>'
						}, {
							match: 'select',
							replacement: '<%= grunt.file.read("src/javascript/defr.select.polyfilled.js") %>'
						}, {
							match: 'queryselector',
							replacement: '{itemtype: \'http://defr.jkphl.is/assets\', className: \'defr\'}'
						}, {
							match: 'append',
							replacement: 'append'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/javascript/defr.main.js'], dest: 'lib/localstorage-polyfilled'}
				]
			},
			defrSimple: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/simple.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.simple.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/simple'}
				]
			},
			defrSimplePolyfilled: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/simple.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.simple.polyfilled.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/simple-polyfilled'}
				]
			},
			defrLocalstorage: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/localstorage.html") %>'
						},
						{
							match: 'defr',
							replacement: 'defr.localstorage.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/localstorage'}
				]
			},
			defrLocalstoragePolyfilled: {
				options: {
					patterns: [
						{
							match: 'description',
							replacement: '<%= grunt.file.read("src/html/localstorage.html") %>'
						},
						{
							match: 'defr',
//							replacement: 'defr.localstorage.polyfilled.js'
							replacement: 'defr.localstorage.polyfilled.min.js'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['src/html/index.html'], dest: 'lib/localstorage-polyfilled'}
				]
			}
		},
		copy: {
			library: {
				files: [
					{src: ['lib/simple/defr.main.js'], dest: 'lib/defr.simple.js'},
					{src: ['lib/simple-polyfilled/defr.main.js'], dest: 'lib/defr.simple.polyfilled.js'},
					{src: ['lib/localstorage/defr.main.js'], dest: 'lib/defr.localstorage.js'},
					{src: ['lib/localstorage-polyfilled/defr.main.js'], dest: 'lib/defr.localstorage.polyfilled.js'}
				]
			},
			example: {
				files: [
					{src: ['lib/simple/index.html'], dest: 'example/index-simple.html'},
					{src: ['lib/simple-polyfilled/index.html'], dest: 'example/index-simple-polyfilled.html'},
					{src: ['lib/localstorage/index.html'], dest: 'example/index-localstorage.html'},
					{src: ['lib/localstorage-polyfilled/index.html'], dest: 'example/index-localstorage-polyfilled.html'}
				]
			}
		},
		clean: ['lib/simple', 'lib/simple-polyfilled', 'lib/localstorage', 'lib/localstorage-polyfilled'],
		uglify : {
			simple : {
				src : 'lib/simple/defr.main.js',
				dest : 'lib/defr.simple.min.js'
			},
			simplePolyfilled : {
				src : 'lib/simple-polyfilled/defr.main.js',
				dest : 'lib/defr.simple.polyfilled.min.js'
			},
			localstorage : {
				src : 'lib/localstorage/defr.main.js',
				dest : 'lib/defr.localstorage.min.js'
			},
			localstoragePolyfilled : {
				src : 'lib/localstorage-polyfilled/defr.main.js',
				dest : 'lib/defr.localstorage.polyfilled.min.js'
			}
		},
		watch : {
			build : {
				files : ['src/*/*'],
				tasks : ['default'],
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
	grunt.registerTask('default', ['replace:simple', 'replace:localstorage', 'replace:simplePolyfilled', 'replace:localstoragePolyfilled', 'uglify', 'copy:library', 'replace:defrSimple', 'replace:defrLocalstorage', 'replace:defrSimplePolyfilled', 'replace:defrLocalstoragePolyfilled', 'copy:example', 'clean']);
}