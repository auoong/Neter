/**
 * 颜色拾取器插件
 * @author Ly
 * @date 2013/01/07
 */
;Neter.namespace('Neter.ColorPicker');

/**
 * @class
 * @name Neter.ColorPicker
 * @require farbtastic
 * @see <a href="http://acko.net/blog/farbtastic-jquery-color-picker-plug-in/">Farbtastic</a>
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    container    : $('body'),      // 插件容器，默认为body
    acceptor     : null,           // 颜色接收器
    width        : 150,            // 插件宽度，默认150px
    defaultColor : '#808080'       // 默认颜色，默认#808080
 }
 </pre>
 */
;Neter.ColorPicker = function(options) {
    var _this = this;

    this.defaults = {
        container    : $('body'),
        acceptor     : null,
        width        : 150,
        defaultColor : '#FFF'
    };

    Neter.apply(this.defaults, options);

    this.handler = {
        container   : this.defaults.container,
        colorPicker : null,
        farbtastic  : null
    };

    this.defaults.container = null;

    /** @ignore */
    this.method = {
        /** @ignore */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            handler.colorPicker = $('<div></div>').addClass('neter-color-picker').appendTo(handler.container);

            handler.farbtastic = handler.colorPicker.farbtastic({
                callback : defaults.acceptor,
                width    : defaults.width
            }).setColor(defaults.defaultColor);

            return this;
        },
        /** @ignore */
        initLayout : function() {
            return this;
        },
        /** @ignore */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            defaults.acceptor
            .on('click', function(event) {
                event.stopPropagation();
                _this.show();
            });

            handler.colorPicker
            .on('click', function(event) {
                event.stopPropagation();
            });

            handler.container
            .on('click', function() {
                _this.hide();
            });
        }
    };
};

;Neter.apply(Neter.ColorPicker.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.ColorPicker.prototype.render
     * @return {Neter.ColorPicker} 返回插件引用
     */
    render : function() {
        this.method.create().initLayout().bindEvents();

        return this;
    },
    /**
     * 隐藏插件
     * @function
     * @name Neter.ColorPicker.prototype.hide
     * @return {Neter.ColorPicker} 返回插件引用
     */
    hide : function() {
        this.handler.colorPicker.hide();
        return this;
    },
    /**
     * 显示插件
     * @function
     * @name Neter.ColorPicker.prototype.show
     * @return {Neter.ColorPicker} 返回插件引用
     */
    show : function() {
        var handler  = this.handler,
            acceptor = this.defaults.acceptor,
            offset   = acceptor.offset();

        handler.colorPicker.css({
            top  : offset.top + acceptor.outerHeight(),
            left : offset.left
        }).show();

        return this;
    },
    /**
     * 设置颜色
     * @function
     * @name Neter.ColorPicker.prototype.setColor
     * @param {String} color 16进制的颜色字符串
     * @return {Neter.ColorPicker} 返回插件引用
     */
    setColor : function(color) {
        if (/^#[0-9a-fA-F]+/.test(color)) {
            this.defaults.defaultColor = color;
            this.handler.farbtastic.setColor(color);
        }

        return this;
    }
});