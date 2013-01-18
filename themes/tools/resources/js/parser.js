/**
 * 样式解析器
 */
var Parser = function(options) {
    var _this = this;

    this.defaults = {
        templates      : '../templates.css',
        manifest       : '../manifest.json',
        templates_temp : '../templates.temp.css',
        writeFile      : '../write.php'
    };

    $.extend(this.defaults, options, {
        reg : '\\s*?#\\{\\*\\/((.|\\r|\\n)+?)\\/\\*\\}#\\*\\/',
        classes : {
            'global' : {
                'global-body'      : ['font-size', 'color', 'background-color'],
                
                'global-table'     : ['line-spacing'],
                
                'global-header'    : ['font-size', 'color', 'background-color' ],
                
                'global-left-side' : ['font-size', 'color', 'background-color' ],
                
                'global-title-bar' : ['font-size', 'color', 'background-color' ]
            },
            'neter-accordion' : {
                'neter-accordion-item'          : ['font-size', 'color' ],
                'neter-accordion-item-hover'    : ['font-size', 'color', 'background-color' ],
                'neter-accordion-item-selected' : ['font-size', 'color', 'background-color' ]
            },
            'neter-navigation' : {
                'neter-navigation-item'                    : ['background-start-color', 'background-end-color', 'border-color', 'font-size', 'color'],
                'neter-navigation-item-hover'              : ['background-start-color', 'background-end-color', 'border-color', 'font-size', 'color'],
                'neter-navigation-item-selected'           : ['background-start-color', 'background-end-color', 'border-color', 'font-size', 'color'],
                
                'neter-navigation-separator'               : ['background'],
                
                'neter-navigation-item-close-button'       : ['color'],
                'neter-navigation-item-close-button-hover' : ['background-start-color', 'background-end-color', 'border-color', 'color']
            },
            'neter-dock' : {
                'neter-dock-start-button'        : ['background'],
                'neter-dock-start-button-expand' : ['background']
                
                //'neter-dock-list-fix'            : ['background']
            }
        },
        fontSize : {
            '大字号' : '16px',
            '中字号' : '14px',
            '小字号' : '12px'
        },
        cssReg : {
            'background-gradient' : ['background: @end;',
                    'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="@start", endColorstr="@end");',
                    'background: -webkit-gradient(linear, left top, left bottom, from(@start), to(@end));',
                    'background: -moz-linear-gradient(center top, @start, @end) repeat;'].join(''),
            'line-spacing' : 'padding-top: @height;padding-bottom: @height;'
        },
        cssName : {
            'global-body'         : ['.global-body, body'],
            'global-table' : ['table.global-table th, table.global-table td']
        }
    });

    this.handler = {
        themes        : [],
        cssSource     : '',
        currentThemes : '',
        // 分组后的css
        result        : {},
        // 未分组的css
        sources       : {},
        loaded        : false
    };

    this.method = {
        global_parser : function(css) {

        },
        utf8Encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            
            for (var n = 0; n < string.length; n++) {
     
                var c = string.charCodeAt(n);
     
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
     
            }
     
            return utftext;
        },

        crc32 : function(str) {
            var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
            
            str = this.utf8Encode(str);
            crc = 0;

            var x = 0;
            var y = 0;
         
            crc = crc ^ (-1);

            for( var i = 0, iTop = str.length; i < iTop; i++ ) {
                y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
                x = "0x" + table.substr( y * 9, 8 );
                crc = ( crc >>> 8 ) ^ x;
            }
         
            return crc ^ (-1);
        },
        /**
         * 解析CSS
         * @param {String} css 要解析的css
         */
        parser : function(css) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                result   = handler.result,
                sources  = handler.sources,
                reg      = defaults.reg,
                classes  = defaults.classes;
            
            for (var p in classes) {
                // 获取指定类型的css，如：global
                var r = new RegExp(p + reg, 'img');
                r.exec(css);

                var tmp = RegExp.$1 || '',
                    obj = classes[p],
                    ret = {};

                // 遍历样式的类名
                for (var cls in obj) {
                    // 根据类名数组中保存的css属性来组织正则表达式
                    for (var i = 0, arr = obj[cls], len = arr.length; i < len; ++i) {
                        r = new RegExp('\\.' + cls + '(?:.|\\r|\\n)+?\\s' + arr[i] + ':\\s*?(.+?)(?=;)');
                        r.exec(tmp);

                        // 取出匹配到的样式
                        ret[cls + '-' + arr[i]] = (RegExp.$1 || '').replace(/(^\s*)|(\s*$)/g, '');
                    }
                }

                result[p] = ret;
                $.extend(sources, ret);
                ret = null;
            }

            return this;
        }
    };
};

$.extend(Parser.prototype, {
    /**
     * 初始化解析器
     * @param {String} path 主题配置文件路径
     */
    init : function(path) {
        var handler = this.handler;

        path = path || this.defaults.manifest;

        $.getJSON(path, function(json) {
            handler.themes = json;
        });

        return this;
    },
    /**
     * 加载主题
     * @param {String} 要加载的主题名称，空为创建新主题
     */
    load : function(themes) {
        var method  = this.method,
            handler = this.handler,
            file    = handler.themes[themes];

        if (!file) {
            file                  = this.defaults.templates;
            handler.currentThemes = '';
        } else {
            file = '../' + file;
            handler.currentThemes = themes;
        }

        handler.loaded = false;

        $.get(file, { ver : Math.random() }, function(data) {
            var index = data.lastIndexOf('/*'),
                str   = data.substr(0, index),
                value = data.substr(index + 2).replace('*/', '');

            if (method.crc32(str) != value) {
                alert('校验失败！');
            } else {
                method.parser(str);
            }

            handler.loaded = true;
        });

        return this;
    },
    /**
     * 获取指定类型的样式
     * @param {String} type 样式类型如：全局样式global， 插件直接使用插件名称
     */
    get : function(type) {
        type = type || '';

        return this.handler.result[type] || null;
    },
    /**
     * 设置指定类型的样式
     * @param {String} type 样式类型如：全局样式global， 插件直接使用插件名称
     */
    set : function(key, value) {
        if (key) {
            this.handler.sources[key] = value;
        }
        
        return this;
    },
    /**
     * 保存主题
     * @param  {String} themesName 主题名称
     * @param  {String} name       主题css内容
     * @param  {Object} themes     主题配置信息，所有的主题
     * @return {Parser}            插件引用
     */
    saveCss : function(themesName, name, themes) {
        var handler  = this.handler,
            sources  = handler.sources,
            defaults = this.defaults,
            method   = this.method,
            t        = '{';

        for (var p in themes || {}) {
            t += '"' + p + '" : "' + themes[p] + '",';
        }
        t = t.replace(/,$/, '') + '}';

        $.get(this.defaults.templates_temp, function(data) {
            data = data.replace(/@\S+?(?=;|\s|\)|,|'|")/g, function(a) {
                return sources[a.substr(1)] || '';
            });

            $.post(defaults.writeFile, {
                themesName : themesName,
                fileName   : name,
                css        : data + '/*' + method.crc32(data) + '*/',
                themes     : t
            }, function(data) {
                if (!~data.indexOf('失败')) {
                    handler.themes = themes;
                }
                alert(data);
            });
            console.log(data);
        });

        return this;
    },
    /**
     * 格式化成标准的css样式
     * @param  {String} cssName css类名
     * @param  {String} id      元素名，与set方法中的key一致
     * @param  {String} value   css属性值
     * @return {Parser}         当前插件引用
     */
    formatCss : function(cssName, id, value) {
        if (!cssName) { return ''; }

        var defaults    = this.defaults,
            cssAlias    = defaults.cssName,
            cssNameList = cssAlias[cssName] || ['.' + cssName],
            cssReg      = defaults.cssReg,
            key         = id.replace(cssName + '-', ''),
            css         = '';

        $.each(cssNameList, function(index, cssName) {
            var tmp = cssName + '{' + key + ':' + value + ';}';

            // 处理渐变背景样式
            if (~id.indexOf('background-start-color') || ~id.indexOf('background-end-color')) {
                var start = $('#' + id.replace('end-color', 'start-color')).val(),
                    end   = $('#' + id.replace('start-color', 'end-color')).val();

                tmp = cssName + '{' + cssReg['background-gradient'].replace(/@start/g, start).replace(/@end/g, end);
            }

            // 处理行间距
            if (~id.indexOf('line-spacing')) {
                tmp = cssName + '{' + cssReg['line-spacing'].replace(/@height/g, value);
            }

            css += tmp;
        });

        return css;
    },
    // 样式加载状态
    // 初始化页面前一定要判断此状态
    status : function() {
        return this.handler.loaded;
    }
});