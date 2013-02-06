/**
 * 皮肤管理
 * @author Ly
 * @date 2012/11/14
 */
;Neter.namespace('Neter.Skin');

/**
 * @class
 * @name Neter.Skin
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    defaultSkin : Neter.skin() || '天空蓝'
 }
 </pre>
 */
;Neter.Skin = function(options) {
    var _this = this;
    
    this.defaults = {
        defaultSkin : Neter.skin() || '默认'
    };
    
    Neter.apply(this.defaults, options);
    
    this.handler = {
        loaded   : false,
        manifest : null
    };
    
    this.method = {
        getThemes : function() {
            var handler = _this.handler;

            $.getJSON(Neter.path() + 'themes/manifest.json', function(json) {
                handler.manifest = json || {};
                console.log(handler.manifest);
                handler.loaded   = true;
            });

            return this;
        }
    };

    this.method.getThemes();
};

;Neter.apply(Neter.Skin.prototype, {
    /**
     * 按照皮肤名称获取指定的皮肤
     * @function
     * @name Neter.Skin.prototype.getSkin
     * @param {String} [name=this.defaults.defaultSkin] 皮肤名称，省略则返回当前的皮肤。若为true则返回所有的皮肤对象
     * @return {String|Object} 若传递了name名称则返回对应的皮肤路径信息，否则返回皮肤列表对象。
     */
    getSkin : function(name) {
        var skin;
        
        if (name === true) { return this.defaults.manifest; }
        
        name = name || $.cookie('skin') || this.defaults.defaultSkin;
        
        skin = this.handler.manifest[name];

        if (name === '默认' || !skin) {
            return 'templates.temp.css';
        }
        
        return skin;
    },
    /**
     * 应用皮肤
     * @function
     * @name Neter.Skin.prototype.applying
     * @param {String} [name=this.defaults.defaultSkin] 皮肤名称
     * @return {Neter.Skin} 返回插件引用
     */
    applying : function(name) {
        name = name || this.defaults.defaultSkin;
        
        var file = this.getSkin(name),
            path    = Neter.path() + 'themes/' + file,
            skin    = $('link#skin');
        
        skin.length
            ? skin.attr('href', path)
            : $('<link id="skin" rel="stylesheet" type="text/css" />').appendTo($('head').get(0)).attr('href', path);
        
        // 保存到cookie中，有效期30天
        $.cookie('skin', name, { expires : 30 });
        $.cookie('skinFile', file, { expires : 30 });

        Neter.skin(name);
        
        return this;
    },
    // 获取当前配置信息加载状态
    status : function() {
        return this.handler.loaded;
    }
});