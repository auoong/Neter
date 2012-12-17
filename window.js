/**
 * 弹出窗口插件
 * @author Ly
 * @date 2012/11/24
 */
;Neter.namespace('Neter.Window');

/**
 * @class
 * @name Neter.Window
 * @extends Neter.Box
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    container    : document.body,   // 插件的容器
    width        : 300,             // 窗口宽度
    height       : 200,             // 窗口高度
    slideHeight  : 30,              // 显示时滑动的高度差
    paddingWidth : 16,              // paddingLeft+paddingRight的和
    content      : '',              // 盒内容，是一个DOM对象
    left         : 'center',        // 左偏移量，默认为center
    top          : 'center',        // 上偏移量，默认为center
    closeButton  : true,            // 是否显示关闭按钮
    closeEvent   : null,            // 关闭时触发的事件，若返回false则不关闭窗口
    mask         : true,            // 是否需要遮罩，默认为true
    buttons      : []               // 按钮组栏中的按钮[{ name : '按钮名称', cls : 'css类', clickEvent : '单击事件' }]
 }
 </pre>
 */
;Neter.Window = function(options) {
    var _this = this;
    
    this.defaults = {
        container    : document.body,   // 插件的容器
        width        : 300,             // 窗口宽度
        height       : 200,             // 窗口高度
        slideHeight  : 30,              // 显示时滑动的高度差
        paddingWidth : 16,              // paddingLeft+paddingRight的和
        content      : '',              // 盒内容，是一个DOM对象
        left         : 'center',        // 左偏移量，默认为center
        top          : 'center',        // 上偏移量，默认为center
        closeButton  : true,            // 是否显示关闭按钮
        closeEvent   : null,            // 关闭时触发的事件，若返回false则不关闭窗口
        mask         : true,            // 是否需要遮罩，默认为true
        buttons      : []               // 按钮组栏中的按钮[{ name : '按钮名称', cls : 'css类', clickEvent : '单击事件' }]
    };
    
    Neter.apply(this.defaults, options, {
        closeButton                : true,
        // 标题栏高度
        TITLE_BAR_HEIGHT           : 35,
        // 标题栏左边距
        TITLE_BAR_PADDING_LEFT     : 8,
        // 标题栏上下padding
        TITLE_BAR_PADDING_HEIGHT   : 5,
        // 按钮组高度
        BUTTONS_BAR_HEIGHT         : 40,
        // 按钮组右边距
        BUTTONS_BAR_PADDING_RIGHT  : 10,
        // 按钮组上下padding
        BUTTONS_BAR_PADDING_HEIGHT : 6
    });
    
    // 实例化构造函数
    Neter.Box.call(this, this.defaults);
    
    // 强制修正Box类的关闭按钮所占高度
    this.defaults.CLOSE_BUTTON_HEIGHT = 26;
    
    Neter.apply(this.handler, {
        titleBar   : null,
        buttonsBar : null
    });
    
    // 保存父类引用，便于重写父类方法
    var method = this.method,
        _super = Neter.apply({}, method);
    
    // 增加或重写父类方法
    Neter.apply(method, {
        /**
         * 根据按钮名称查找按钮配置信息
         * @ignore
         * @param {String} name 按钮名称
         * @param {Object} 按钮的配置信息
         */
        getButtonOptions : function(name) {
            var buttons = _this.defaults.buttons;
            
            for (vari = 0, len = buttons.length; i < len; ++i) {
                if (buttons[i].name === name) {
                    return buttons[i];
                }
            }
            
            return null;
        },
        /**
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            _super.create.call(this);
            
            // 增加窗口类
            handler.box.addClass('neter-window');
            
            // 增加遮罩层
            handler.shadow = $('<div></div>').addClass('neter-window-shadow')
                .appendTo(handler.container);
            
            // 创建标题栏
            handler.titleBar = $('<div></div>').addClass('neter-window-title-bar')
                .append(defaults.title)
                .appendTo(handler.box);
            
            // 创建按钮组栏
            handler.buttonsBar = $('<div></div>').addClass('neter-window-buttons-bar')
                .appendTo(handler.box);
            
            // 增加按钮
            $.each(defaults.buttons || [], function(index, item) {
                $('<input type="button"/>').addClass('neter-window-buttons-bar-button')
                    .addClass(item.cls)
                    .val(item.name)
                    .bind('click', function(event) {
                        typeof item.clickEvent === 'function' && item.clickEvent.call(this, _this, event);
                        event.stopPropagation();
                    })
                    .appendTo(handler.buttonsBar);
            });
            
            return this;
        },
        /**
         * @ignore
         */
        initLayout : function() {
            _super.initLayout.call(this);
            
            var defaults = _this.defaults,
                handler  = _this.handler,
                buttonsBarHeight = defaults.buttons && defaults.buttons.length ? defaults.BUTTONS_BAR_HEIGHT : 0,
                boxWidth = handler.box.outerWidth() - defaults.BORDER_WIDTH,
                height   = defaults.height - defaults.PADDING_HEIGHT - defaults.BORDER_WIDTH - (defaults.closeButton ? defaults.CLOSE_BUTTON_HEIGHT : 0) - buttonsBarHeight;
            
            defaults.mask && handler.shadow.show();
            
            // 设置窗口视图
            handler.view.css({
                height : height
            });
            
            // 设置标题栏
            handler.titleBar.css({
                width       : boxWidth - defaults.CLOSE_BUTTON_WIDTH - defaults.TITLE_BAR_PADDING_LEFT - defaults.CLOSE_BUTTON_RIGHT,
                height      : defaults.TITLE_BAR_HEIGHT - defaults.TITLE_BAR_PADDING_HEIGHT,
                paddingLeft : defaults.TITLE_BAR_PADDING_LEFT,
                paddingTop  : defaults.TITLE_BAR_PADDING_HEIGHT
            });
            
            // 设置按钮组栏
            defaults.buttons && defaults.buttons.length
                && handler.buttonsBar.css({
                    height     : buttonsBarHeight - defaults.BUTTONS_BAR_PADDING_HEIGHT,
                    width      : boxWidth - defaults.BUTTONS_BAR_PADDING_RIGHT,
                    paddingTop : defaults.BUTTONS_BAR_PADDING_HEIGHT,
                    paddingRight : defaults.BUTTONS_BAR_PADDING_RIGHT
                }).show();
            
            return this;
        },
        /**
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                box      = handler.box,
                offset   = {},
                dragEvents = {
                    down : function(event) {
                        var o = $(this).offset();
                        
                        typeof box.get(0).setCapture === 'function' && box.get(0).setCapture();
                        window.captureEvents && window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                        
                        $(this).css('cursor', 'move');
                        
                        offset = {
                            left : event.clientX - o.left,
                            top  : event.clientY - o.top
                        };
                        
                        $(document).bind('mousemove', dragEvents.move)
                                 .bind('mouseup', dragEvents.up);
                        
                    },
                    move : function(event) {
                        box.css({
                            left : event.clientX - offset.left,
                            top  : event.clientY - offset.top
                        });
                        window.getSelection && window.getSelection().removeAllRanges(); // w3c
                        document.selection && document.selection.empty();//IE
                    },
                    up   : function(event) {
                        typeof box.get(0).releaseCapture === 'function' && box.get(0).releaseCapture();
                        window.captureEvents && window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                        
                        handler.titleBar.css('cursor', 'default');
                        
                        $(document).unbind('mousemove', dragEvents.move)
                                 .unbind('mouseup', dragEvents.up);
                    }
                };
            
            _super.bindEvents.call(this);
            
            handler.titleBar.bind('mousedown', function(event) { dragEvents.down.call(this, event); });
            
            return this;
        },
        /**
         * @ignore
         */
        remove : function(event) {
            var handler = _this.handler;
            
            // 先将遮罩层删除
            handler.shadow.remove();
            
            _super.remove.call(this, event);
        }
    });
};

;Neter.apply(Neter.Window.prototype, Neter.Box.prototype, {
    /**
     * 设置或获取标题
     * @function
     * @name Neter.Window.prototype.title
     * @param {String|HTMLElement} [title] 新的标题，可以是一个dom对象，省略则返回标题内容
     * @return {String|jqueryDOM|Neter.Window} 如果传递了title参数，则返回插件引用，否则返回当前的标题，类型取决于实例化时传递的类型
     */
    title : function(title) {
        var defaults = this.defaults,
            handler  = this.handler;
        
        if (arguments.length) {
            handler.titleBar.empty().append(defaults.title = title);
            
            return this;
        } else {
            return defaults.title;
        }
    },
    /**
     * 关闭窗口
     * @function
     * @name Neter.Window.prototype.close
     * @return {Neter.Window} 返回插件引用
     */
    'close' : function() {
        this.remove();
        return this;
    }
});