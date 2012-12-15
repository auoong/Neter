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
    defaultSkin : Neter.skin() || '天空蓝',
    skins : [{
        name  : '天空蓝',
        color : '#135BA5',
        path  : 'blue.css',
        left  : 0,
        top   : 0
    }, {
        name  : '墨蓝',
        color : '#567086',
        path  : 'darkblue.css',
        left  : '0',
        top   : '-180px'
    }, {
        name  : '清新绿',
        color : '#037C11',
        path  : 'green.css',
        left  : '-90px',
        top   : 0
    }, {
        name  : '海水蓝',
        color : '#0086B1',
        path  : 'yeahblue.css',
        left  : '-450px',
        top   : 0
    }, {
        name  : '咖啡时光',
        color : '#CDB592',
        path  : 'coffee.css',
        left  : '-450px',
        top   : '-180px'
    }]
 }
 </pre>
 */
;Neter.Skin = function(options) {
    var _this = this;
    
    this.defaults = {
        defaultSkin : Neter.skin() || '天空蓝',
        skins : [{
            name  : '天空蓝',
            color : '#135BA5',
            path  : 'blue.css',
            left  : 0,
            top   : 0
        }, {
            name  : '墨蓝',
            color : '#567086',
            path  : 'darkblue.css',
            left  : '0',
            top   : '-180px'
        }, {
            name  : '清新绿',
            color : '#037C11',
            path  : 'green.css',
            left  : '-90px',
            top   : 0
        }, {
            name  : '海水蓝',
            color : '#0086B1',
            path  : 'yeahblue.css',
            left  : '-450px',
            top   : 0
        }, {
            name  : '咖啡时光',
            color : '#CDB592',
            path  : 'coffee.css',
            left  : '-450px',
            top   : '-180px'
        }]
    };
    
    Neter.apply(this.defaults, options);
    
    this.handler = {
    };
    
    this.method = {
    };
};

;Neter.apply(Neter.Skin.prototype, {
    /**
     * 按照皮肤名称获取指定的皮肤
     * @function
     * @name Neter.Skin.prototype.getSkin
     * @param {String} [name=this.defaults.defaultSkin] 皮肤名称，省略则返回当前的皮肤。若为true则返回所有的皮肤
     * @return {String|Neter.Skin} 若传递了name名称则返回对应的皮肤配置信息，否则返回插件引用。
     */
    getSkin : function(name) {
        var skin;
        
        if (name === true) { return this.defaults.skins; }
        
        name = name || this.defaults.defaultSkin;
        
        $.each(this.defaults.skins, function(index, value) {
            if (value.name == name) { skin = value; }
        });
        
        return skin || {};
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
        
        var options = this.getSkin(name),
            path    = Neter.path() + 'resources/css/' + options.path,
            skin    = $('link#skin');
        
        skin.length
            ? skin.attr('href', path)
            : $('<link id="skin" rel="stylesheet" type="text/css" />').appendTo($('head').get(0)).attr('href', path);
        
        Neter.skin(name);
        Neter.color(options.color);
        
        return this;
    }
});