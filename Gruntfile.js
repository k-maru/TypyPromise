module.exports = function(grunt){

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-karma");

    grunt.registerTask("build", ["typescript:default", "browserify:default", "mochaTest:default", "karma:default"]);
    grunt.registerTask("watch", ["typescript:default"]);
    grunt.registerTask("default", ["build"]);

    if(grunt.cli.tasks.indexOf("watch") > -1){
        grunt.option("watch", true);
    }

    grunt.initConfig({
        typescript: {
            default: {
                src: "src/**/*.ts",
                dest: "bin/node",
                options: {
                    basePath: "src",
                    sourceMap: true,
                    declaration: true,
                    noLib: true,
                    references: "core",
                    module: "commonjs",
                    watch: grunt.option("watch") ? {
                        atBegin: true,
                        after: ["browserify:default", "jasmine_node:default"]
                    }: false
                }
            }
        },

        browserify: {
            default: {
                src: ["src/browser.js","bin/node/*.js"],
                dest: "bin/browser/Typy.Promise.js",
                options: {
                    browserifyOptions:  {
                        builtins: false
                    }
                }
            }
        },
        mochaTest: {
            default:{
                src: ["test/**/*.spec.js"]
            }
        },
        karma: {
            default: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    });

    grunt.registerTask("bowerconfig", function(){
        var pkg = grunt.file.readJSON("package.json"),
            config = {
              "name": pkg.name,
              "version": pkg.version,
              "homepage": pkg.homepage,
              "description": pkg.description,
              "main": "bin/browser/Typy.Promise.js",
              "keywords": pkg.keywords,
              "authors": [
                pkg.author
              ],
              "license": pkg.license,
              "ignore": [
                "**/.*",
                "node_modules",
                "bower_components",
                "test",
                "src",
                "Gruntfile.js",
                "karma.conf.js",
                "package.json",
                "bin/node"
              ]
          };
          grunt.file.write("bower.json", JSON.stringify(config, null, "  "));
    });
}
