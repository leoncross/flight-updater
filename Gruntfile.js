const multiReporterConfigFile = 'config/mochaReporterConfig.json';

module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      options: {
        fix: true,
      },
      target: '.',
    },

    mochaTest: {
      unit: {
        src: ['tests/unit/**/**.js'],
        options: {
          recursive: true,
          reporter: 'mocha-multi-reporters',
          reporterOptions: {
            configFile: multiReporterConfigFile,
          },
        },
      },
      functional: {
        src: ['tests/functional/**/**.js'],
        options: {
          recursive: true,
          reporter: 'mocha-multi-reporters',
          reporterOptions: {
            configFile: multiReporterConfigFile,
          },
        },
      },
    },

    nyc: {
      cover: {
        options: {
          cwd: '.',
          include: ['**/*.js', '!.*.js', '!Gruntfile.js'],
          reporter: ['html', 'text'],
          all: true,
        },
        cmd: false,
        args: ['mocha', 'tests/unit/**/**.js', 'tests/functional/**/**.js', '--recursive'],
      },
    },

    clean: ['.nyc_output', 'test-results'],

    prettier: {
      options: {
        singleQuote: true,
        printWidth: 100,
      },
      files: {
        src: ['**/*.js', 'test/**/**/*.js', '*.js', '!coverage/**', '!node_modules/**/**/*.js'],
      },
    },

    watch: {
      files: ['src/**/*.js', 'test/**/*.js', 'config/**/*.js', 'app.js'],
      tasks: ['prettier', 'eslint', 'nyc'],
    },
  });

  grunt.loadNpmTasks('grunt-simple-nyc');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-prettier');

  grunt.registerTask('test', ['unit', 'functional', 'nyc']);
  grunt.registerTask('unit', ['mochaTest:unit']);
  grunt.registerTask('functional', ['mochaTest:functional']);
  grunt.registerTask('dev', ['prettier', 'eslint']);
  grunt.registerTask('dev_watch', ['dev', 'watch']);
  grunt.registerTask('default', ['clean', 'dev', 'test']);
};
