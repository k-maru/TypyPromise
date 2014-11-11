module.exports = function(grunt){
    grunt.initConfig({

        typescript: {
            default: {
                src: "src/promise.ts",
                dest: "bin/typy.promise.js",
                options: {
                    sourceMap: true,
                    declaration: true,
                    //noLib: true,
                    references: "core",
                    watch: grunt.option("watch") ? {
                        atBegin: true
                    }: false
                }
            }
        }

    });

    grunt.loadNpmTasks("grunt-typescript");
    grunt.registerTask("build", ["typescript:default"]);
    grunt.registerTask("default", ["build"]);
}
