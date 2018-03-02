module.exports = function (grunt) {

    var encoding = { encoding : 'utf-8' };

    grunt.initConfig({
        uglify: {
            options: {
                sourceMap: {
                    includeSources: true
                }
            },
            js: {
                files: [{
                    expand: true,
                    cwd: 'lib',
                    src: '**/*.js',
                    dest: 'dest'
                }]
            }
        },
        cssmin : {
            css : {
                src : 'css/css.css',
                dest : 'css/css.min.css'
            }
        },
        clean : {
            js : {
                src : ['dest']
            },
            css : ['css/css.min.css']
        },
        watch:{
            js:{
                files:['lib/*.js'],
                tasks:['uglify'],
            },
            options: {  
                debounceDelay: 1000  
            },
            css : {
                files:['css/css.css'],
                tasks:['cssmin'],
            }
        }
    });
    var recive = function recive( pathname, reg, pattern ){
        return grunt.file.read( pathname, encoding ).replace( reg, pattern )
    }
    grunt.registerTask( 'path', 'switch jsvascript catalog', function(sym){
        var pathname = 'seajs-config.js';
        var reg = /base\s*\:\s*\'(.+)\'/g;

        switch( sym ){
            case 'lib' : recive( pathname, reg, "base : 'lib\/'"); break;
            case 'dest' : recive( pathname, reg, "base : 'dest\/'"); break;
            default : grunt.log.write( seajsConfig.match( reg ) );
        }
        console.log( seajsConfig );
        grunt.file.write( pathname, seajsConfig, encoding );
    });
    grunt.registerTask('tip','tip',function(){
        grunt.log.write('自定义命令 : \n  api: 切换接口地址 \n     参数列表\n\tdev -> 测试\n\tloc -> 本地 \n\tpro -> 正式');
    });

    grunt.registerTask('api','api adress',function( address ){
        var pathname = 'lib/common.js';
        var reg = /[\'|\"](http\:\/\/.+(\/server\/stock\.do)[\'|\"]\,.*)/g;
        var json = {
            dev : ["http://61.164.118.197:8087/gssstock/server/stock.do",' 测试'],
            pro : ["http://stock.guoss.cn/gss_stock/server/stock.do",' 正式']
        };
        var commonJs = grunt.file.read( pathname, encoding );
            !address ? grunt.log.write( commonJs.match( reg ) ) : grunt.file.write(
                   pathname, 
                   commonJs.replace( reg, '\"' + json[address][0] + '\"\, \/\/' + json[address][1])
               ); 
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-cmd-concat');
}