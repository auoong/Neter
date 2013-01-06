/**
 * 盒子插件
 * @author Ly
 * @date 2012/11/16
 */
;Neter.namespace('Neter.Box');

/**
 * @class
 * @name Neter.Box
 * @param {Object} [options] 自定义配置信息
 <pre>
   options = {
    container    : document.body,   // 插件的容器
    width        : 300,             // 盒宽度
    height       : 200,             // 盒高度
    slideHeight  : 10,              // 显示时滑动的高度差
    paddingWidth : 16,              // paddingLeft+paddingRight的和
    content      : '',              // 盒内容，是一个DOM对象
    left         : 'center',        // 左偏移量，默认为center
    top          : 'center',        // 上偏移量，默认为center
    closeButton  : true,            // 是否显示关闭按钮
    closeEvent   : null             // 关闭时触发的事件，若返回false则不关闭窗口
 }
 </pre>
 */
;Neter.Box = function(options) {
    var _this = this;
    
    this.defaults = {
        container    : document.body,   // 插件的容器
        width        : 300,             // 盒宽度
        height       : 200,             // 盒高度
        slideHeight  : 10,              // 显示时滑动的高度差
        paddingWidth : 16,              // paddingLeft+paddingRight的和
        fadeIn       : true,            // 淡入效果，默认true
        content      : '',              // 盒内容，是一个DOM对象
        left         : 'center',        // 左偏移量，默认为center
        top          : 'center',        // 上偏移量，默认为center
        closeButton  : true,            // 是否显示关闭按钮
        closeEvent   : null             // 关闭时触发的事件，若返回false则不关闭窗口
    };
    
    Neter.apply(this.defaults, options, {
        // 关闭按钮所占高度，排除原有padding-top后的值
        CLOSE_BUTTON_HEIGHT : 15,
        // 关闭按钮居右宽度
        CLOSE_BUTTON_RIGHT  : 8,
        // 关闭按钮所占宽度
        CLOSE_BUTTON_WIDTH  : 25,
        // padding高度
        PADDING_HEIGHT      : 16,
        // padding宽度
        PADDING_WIDTH       : 2,
        // 边框宽度，两条边都计算后
        BORDER_WIDTH        : 4
    });
    
    this.handler = {
        container   : $(this.defaults.container),
        box         : null,
        view        : null,
        closeButton : null
    };
    
    /** @ignore */
    this.method = {
        /**
         * 创建框架
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            // 创建盒子
            handler.box = $('<div></div>').addClass('neter-box')
                .appendTo(handler.container);
            
            // 创建关闭按钮
            handler.closeButton = $('<span></span>').addClass('neter-box-close-button')
                .append($('<b></b>').html('x'))
                .appendTo(handler.box);
            
            // 创建盒子视图，即内容容器
            handler.view = $('<div></div>').addClass('neter-box-view')
                .append(defaults.content)
                .appendTo(handler.box);
            
            return this;
        },
        /**
         * 初始化布局
         * @ignore
         */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                width    = defaults.width - defaults.paddingWidth - defaults.BORDER_WIDTH,
                height   = defaults.height - defaults.PADDING_HEIGHT - defaults.BORDER_WIDTH - (defaults.closeButton ? defaults.CLOSE_BUTTON_HEIGHT : 0);
            
            handler.box.css({
                width        : width,
                height       : height,
                paddingLeft  : defaults.paddingWidth / 2,
                paddingRight : defaults.paddingWidth / 2
            });

            handler.view.css({
                width  : width,
                height : height
            })
            
            // 设置是否显示关闭按钮
            defaults.closeButton
                && handler.closeButton.show()
                && handler.box.css({ paddingTop : defaults.PADDING_HEIGHT / 2 + defaults.CLOSE_BUTTON_HEIGHT });
            
            return this;
        },
        /**
         * 绑定事件
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this;
            
            handler.box
            // 关闭按钮事件
            .on('click', '.neter-box-close-button', function(event) {
                method.remove(event);
            });
            
            return this;
        },
        /**
         * 显示插件
         * @ignore
         * @param {Number} left 位置的左偏移量
         * @param {Number} top 位置的上偏移量
         */
        show : function(left, top) {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            left = left == 'center' ? (handler.container.width() / 2 + handler.container.scrollLeft() - handler.box.outerWidth() / 2) : left;
            top  = top == 'center' ? (handler.container.height() / 2 + handler.container.scrollTop() - handler.box.outerHeight() / 2) : top;
            
            var start = { left : left, top : top - defaults.slideHeight };
            
            handler.box
                && handler.box
                    .css({ left : start.left, top : start.top, opacity : (defaults.fadeIn ? 0 : 1) })
                    .show()
                && defaults.fadeIn
                && handler.box
                    .animate({ left : left, top : top, opacity : 1 });
            
            return this;
        },
        /**
         * 隐藏插件
         * @ignore
         */
        hide : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            handler.box && handler.box.fadeOut('fast');
            
            return this;
        },
        /**
         * 删除插件
         * @ignore
         */
        remove : function(event) {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            if (defaults.closeEvent && typeof defaults.closeEvent === 'function') {
                if (defaults.closeEvent.call(this, _this, event) === false) { return this; }
            }
            handler.box.empty().remove();
            
            for (var p in handler) {
                handler[p] = null;
            }
        }
    };
};

;Neter.apply(Neter.Box.prototype, {
    /**
     * 渲染插件
     * @type Function
     * @function
     * @name Neter.Box.prototype.render
     * @param {Boolean} [show=true] 是否直接显示出窗口，仅值为false时不显示
     * @return {Neter.Box} 返回插件引用
     * @example

// render后直接显示当前窗口
new Neter.Box({ content : 'example...'}).render();

// render后窗口不显示，要调用show()方法
new Neter.Box({ content : 'example...'}).render(false);
     */
    render : function(show) {
        var defaults = this.defaults;
        
        this.method.create().initLayout().bindEvents();
        
        show !== false && this.method.show(defaults.left, defaults.top);
        
        return this;
    },
    /**
     * 设置或者获取盒子内的元素
     * @function
     * @name Neter.Box.prototype.content
     * @param {HTMLElement} [content] 要设置的DOM对象，省略则返回原有的内容元素。
     * @param {Boolean} [append=false] 是否在原基础上追加元素，默认为false
     * @return {Object|Array} 如果不带参数则返回内容集合，否则返回Neter.Box引用
     * @example

var box = new Neter.Box({ content : 'example...'}).render();

// 获取当前盒子内容
console.log(box.content());

// 重新设置内容为#test元素的内容
box.content($('#test'));

     */
    content : function(content, append) {
        if (arguments.length) {
            !append && this.handler.view.empty();
            
            this.handler.view.append(content);
            
            this.defaults.content = this.handler.view.children();
            
            return this;
        }
        
        return this.defaults.content;
    },
    /**
     * 获取盒对象
     * @function
     * @name Neter.Box.prototype.get
     * @return {jQueryDOM} 返回当前的盒对象
     * @example
console.log(new Neter.Box({ content : 'example...'})render().get());
     */
    get : function() {
        return this.handler.box;
    },
    /**
     * 获取视图对象
     * @function
     * @name Neter.Box.prototype.getView
     * @return {jQueryDOM} 返回当前的视图对象
     */
    getView : function() {
        return this.handler.view;
    },
    /**
     * 显示插件，两个省略都省略时居中
     * @function
     * @name Neter.Box.prototype.show
     * @param {Number} [left] 位置的左偏移量
     * @param {Number} [top] 位置的上偏移量
     * @return {Neter.Box} 返回插件的引用
     * @example
// 创建一个不立即显示的窗口，使用show方法让窗口显示到100,200的位置
new Neter.Box({ content : 'example...'}).render(false).show(100, 200);
     */
    show : function(left, top) {
        var defaults = this.defaults;

        arguments.length == 0 && (left = defaults.left, top = defaults.top);
        this.method.show(left, top);
        
        return this;
    },
    /**
     * 获取或设置宽度
     * @function
     * @name Neter.Box.prototype.width
     * @param {Number|String} width 要设置的宽度，可以是auto或数字，省略则获取宽度
     * @param {Boolean} [flag=true] width值是否为外围宽度，默认为true。为false时需要加上padding与border
     */
    width : function(width, flag) {
        var defaults = this.defaults;

        if (!arguments.length) { return defaults.width; }

        defaults.width = width === 'auto'
            ? 'auto'
            : (flag === false ? width + defaults.PADDING_WIDTH + defaults.BORDER_WIDTH : width);

        this.method.initLayout();

        return this;
    },
    /**
     * 获取或设置高度
     * @function
     * @name Neter.Box.prototype.height
     * @param {Number|String} height 要设置的高度，可以是auto或数字，省略则获取高度
     * @param {Boolean} [flag=true] height值是否为外围高度，默认为true。为false时需要加上padding与border
     */
    height : function(height, flag) {
        var defaults = this.defaults;

        if (!arguments.length) { return defaults.height; }

        defaults.height = height === 'auto'
            ? 'auto'
            : (flag === false ? height + defaults.PADDING_HEIGHT + defaults.BORDER_WIDTH : height);

        this.method.initLayout();

        return this;
    },
    /**
     * 隐藏插件
     * @function
     * @name Neter.Box.prototype.hide
     * @return {Neter.Box} 返回插件的引用
     * @example
// 创建一个窗口，5秒后自动隐藏
var box = new Neter.Box({ content : 'example...'}).render();
setTimeout(function() { box.hide(); }, 5000);
     */
    hide : function() {
        this.method.hide();
        
        return this;
    },
    /**
     * 删除插件，删除后不可再调用show进行显示
     * @function
     * @name Neter.Box.prototype.remove
     * @example
// 创建一个窗口，5秒后销毁
var box = new Neter.Box({ content : 'example...'}).render();
setTimeout(function() { box.remove(); }, 5000);

     */
    remove : function(event) {
        this.method.remove(event);

        return null;
    }
});