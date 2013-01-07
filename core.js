/**
 * Neter核心库
 * @author Ly
 * @date 2012/11/14
 * @version 1.0
 * @namespace Neter
 */
;(function(window, $) {
    // 插件相对于调用页面的路径
    var __path__  = '',
        __skin__  = '天空蓝',
        __color__ = '#135BA5',
        __count__ = 0;
    
    /**
     * @static
     * @class
     * @name Neter
     */
    window.Neter = window.Neter || {};

    /**
     * 拷贝属性
     * @static
     * @function
     * @name Neter.apply
     * @param {Object} aim 目标对象
     * @param {Object} source 源对象
     * @param {Object} [defaults] 默认对象，即用这个对象中的值覆盖源对象中同名属性
     * @param {Array} [mask] 需要屏蔽掉的属性，即不需要拷贝的属性
     * @return {Object} 返回目标对象aim
     */
    Neter.apply = function(aim, source, defaults, mask) {
        aim      = aim || {};
        source   = source || {};

        if (defaults instanceof Array) {
            mask     = defaults;
            defaults = {};
        }
        
        defaults = defaults || {};
        mask     = mask || [];
        
        for (var p in source) {
            if (~$.inArray(p, mask)) { continue; }
            aim[p] = source[p];
        }
        
        for (var p in defaults) {
            if (~$.inArray(p, mask)) { continue; }
            aim[p] = defaults[p];
        }
        
        return aim;
    };
    
    Neter.apply(Neter, {
        /**
         * @type String
         * @constant
         * @name Neter.version
         */
        version : '1.0',
        
        /**
         * 创建命名空间
         * @static
         * @function
         * @name Neter.namespace
         * @param {String} namespace 以点分隔的命令空间字符串，即要转换的字符串。
         * @return {Neter} 返回Neter引用
         */
        namespace : function(namespace) {
            var arg = arguments, ns = null, nsArray, obj;
            
            for (var i = 0; i < arg.length; i++) {
                nsArray = arg[i].split('.');
                obj = nsArray[0];
                
                eval('if (typeof ' + obj + ' == "undefined") { ' + obj + ' = {}; } ns = ' + obj + ';');
                
                for (var j = 1; j < nsArray.length; j++) {
                    ns[nsArray[j]] = ns[nsArray[j]] || {};
                    ns = ns[nsArray[j]];
                }
            }
            
            return this;
        },
        /**
         * 日志输入，如果开启Firebug，则直接使用控制台进行输出。若在控制台中无法调用console则不输出日志
         * @static
         * @function
         * @name Neter.log
         * @param {*} msg 要输出的信息，可以是字符串，也可以是一个dom元素，字符串中支持点位符：%d/%s/%o
         * @param {*} [param] 用来填充参数msg点位符的参数，当有此参数时必须传递type参数。
         * @param {String} [type='log'] 输出类型，默认为log，支持info/warning/error等
         */
        'log' : function(msg, param, type) {
            var arg = [].slice.call(arguments, 0);
            
            type = arg.length < 2 ? 'log' : arg.pop();
            
            typeof console === 'object' && typeof console[type] === 'function' && console[type].apply(console, arg);
            
            return this;
        },
        /**
         * 设置或获取插件路径
         * @static
         * @function
         * @name Neter.path
         * @param {String} [path] 插件路径，省略则为获取插件路径
         * @return {String|Neter} 若有path参数，则返回Neter引用，否则返回插件路径。
         */
        path : function(path) {
            if (path) {
                __path__ = path;
            } else {
                return __path__;
            }
            return this;
        },
        
        /**
         * 获取或保存当前系统中正在使用的皮肤
         * @static
         * @function
         * @name Neter.skin
         * @param {String} [name='天空蓝'] 要保存的皮肤名称，省略则获取
         * @return {String|Neter} 若提供color参数则返回Neter引用，否则返回当前的皮肤名称
         */
        skin : function(name) {
            if (name) {
                __skin__ = name;
            } else {
                return __skin__;
            }
            return this;
        },
        /**
         * 设置获取保存当前皮肤的基准色
         * @static
         * @function
         * @name Neter.color
         * @param {Number|String} [color='#135BA5'] 要设置的颜色，省略则获取
         * @return {String|Neter} 若提供color参数则返回Neter引用，否则返回当前的颜色值
         */
        color : function(color) {
            if (typeof color === 'undefined') {
                return __color__;
            } else {
                __color__ = color;
            }
            return this;
        },
        /**
         * 计数器
         * @static
         * @function
         * @name Neter.count
         * @param {Number} [count=0] 计数起始值，默认为0
         * @return {Number|Neter} 带有count参数返回Neter引用，否则返回当前系统计数。
         */
        count : function(count) {
            if (typeof count === 'number') {
                __count__ = count;
                return this;
            } else {
                return __count__++;
            }
        }
    });
})(window, $);