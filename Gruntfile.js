module.exports = function(grunt){

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-jasmine-node");

    grunt.registerTask("build", ["typescript:default", "browserify:default", "jasmine_node:default"]);
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

        jasmine_node: {
            default:{
                src: ["test/"]
            }
        }

    });
}
