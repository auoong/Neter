/**
 * 工具小提示插件
 * @author Ly
 * @date 2012/12/25
 */
;Neter.namespace('Neter.ToolTips');

/**
 * @class
 * @extends Neter.Box
 * @name Neter.ToolTips
 * @param {Object} [options] 自定义配置信息
<pre>
optiosn = {
    container : document.body,   // 插件的容器
    trigger   : null,            // 触发对象
    mode      : 'hover',         // 触发方式，支持：hover/click
    hoverTime : 1000,            // 悬停时间，单位毫秒
        
    // 显示位置，默认bottom，支持：top/right/bottom/left
    // top时若显示不开自动切换为bottom。left时若显示不开自动切换为right。
    position  : 'bottom',        
        
    width     : 220,             // 插件宽度
    height    : 100,             // 插件高度
    content   : ''               // 插件内容，是一个DOM对象
}
</pre>
 */
;Neter.ToolTips = function(options) {
    var _this = this;

    this.defaults = {
        container : document.body,   // 插件的容器
        trigger   : null,            // 触发对象
        mode      : 'hover',         // 触发方式，支持：hover/click
        hoverTime : 1000,            // 悬停时间，单位毫秒
        
        // 显示位置，默认bottom，支持：top/right/bottom/left
        // top时若显示不开自动切换为bottom。left时若显示不开自动切换为right。
        position  : 'bottom',        
        
        width     : 220,             // 插件宽度
        height    : 100,             // 插件高度
        content   : ''               // 插件内容，是一个DOM对象
    };

    Neter.apply(this.defaults, options, {
        fadeIn       : false,
        slideHeight  : 0,
        paddingWidth : 0,
        closeButton  : false,
        closeEvent   : null,
        HIDE_DELAY   : 200,
        ARROW_GAP    : 3,
        ARROW_HEIGHT : 15,
        ARROW_WIDTH  : 15
    });

    Neter.Box.call(this, this.defaults);

    Neter.apply(this.defaults, {
        PADDING_HEIGHT : 0,
        PADDING_WIDTH  : 0
    });

    Neter.apply(this.handler, {
        inArrow  : null,
        outArrow : null
    });

    var method = this.method,
        _super = Neter.apply({}, method);

    Neter.apply(method, {
        /** @ignore */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            _super.create.call(this);

            handler.box.addClass('neter-tool-tips');

            handler.inArrow = $('<div><b>◆</b></div>').addClass('neter-tool-tips-in-arrow')
                .appendTo(handler.container);

            handler.outArrow = $('<div><b>◆</b></div>').addClass('neter-tool-tips-out-arrow')
                .appendTo(handler.container);


            return this;
        },
        /** @ignore */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                offset   = defaults.trigger.offset(),
                left     = 0,
                top      = 0;

            _super.initLayout.call(this);
            
            switch (defaults.position) {
            case 'left':
                top           = defaults.top = offset.top - 10;
                left          = offset.left - defaults.ARROW_WIDTH;
                defaults.left = left - handler.box.outerWidth() + defaults.BORDER_WIDTH / 2;
                top           += 5;

                handler.outArrow.addClass('neter-tool-tips-out-arrow-left').css({ left : left, top  : top });
                handler.inArrow.addClass('neter-tool-tips-in-arrow-left').css({ left  : left, top  : top });

                if (defaults.left >= 0) { break; }
            case 'right':
                top           = defaults.top = offset.top - 10;
                left          = offset.left + defaults.trigger.outerWidth();
                defaults.left = left + defaults.ARROW_WIDTH - defaults.BORDER_WIDTH / 2;
                top           += 5;

                handler.outArrow
                    .removeClass('neter-tool-tips-out-arrow-left')
                    .addClass('neter-tool-tips-out-arrow-right')
                    .css({ left : left, top  : top });
                handler.inArrow
                    .removeClass('neter-tool-tips-in-arrow-left')
                    .addClass('neter-tool-tips-in-arrow-right')
                    .css({ left  : left, top  : top });
                break;
            case 'top':
                top          = offset.top - defaults.ARROW_HEIGHT;
                left         = defaults.left = offset.left;
                defaults.top = top - handler.box.outerHeight() + defaults.BORDER_WIDTH / 2;
                left         += 5;

                handler.outArrow.addClass('neter-tool-tips-out-arrow-top').css({ left : left, top  : top });
                handler.inArrow.addClass('neter-tool-tips-in-arrow-top').css({ left  : left, top  : top });
                if (defaults.top >= 0 ) { break; }
            case 'bottom':
                top          = offset.top + defaults.trigger.outerHeight();
                left         = defaults.left = offset.left;
                defaults.top = top + defaults.ARROW_HEIGHT - defaults.BORDER_WIDTH / 2;
                left         += 5;

                handler.outArrow
                    .removeClass('neter-tool-tips-out-arrow-top')
                    .css({ left : left, top  : top });
                handler.inArrow
                    .removeClass('neter-tool-tips-in-arrow-top')
                    .addClass('neter-tool-tips-in-arrow-bottom')
                    .css({ left  : left, top  : top });
                break;
        }

            return this;
        },
        /** @ignore */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                timer1   = null,
                timer2   = null;

            if (defaults.mode === 'hover') {
                defaults.trigger
                .on('mouseenter', function(event) {
                    timer1 = setTimeout(function() { _this.show(); }, defaults.hoverTime);
                })
                .on('mouseleave', function() {
                    timer2 = setTimeout(function() {
                        clearTimeout(timer1);
                        _this.hide();
                    }, defaults.HIDE_DELAY);
                });
                
                handler.box
                .on('mouseenter', function() { clearTimeout(timer2); })
                .on('mouseleave', function() { _this.hide(); });
            } else {
                defaults.trigger.on('click', function() { _this.show(); });

                $('body').on('click', function() { _this.hide(); });
            }
            
            return this;
        }
    });
};

;Neter.apply(Neter.ToolTips.prototype, Neter.Box.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.ToolTips.prototype.render
     * @return {Neter.ToolTips} 返回插件的引用
     */
    render : function() {
        Neter.Box.prototype.render.call(this, false);

        return this;
    },
    /**
     * 显示插件
     * @function
     * @name Neter.ToolTips.prototype.show
     * @return {Neter.ToolTips} 返回插件的引用
     */
    show : function() {
        var handler = this.handler;

        Neter.Box.prototype.show.apply(this, arguments);

        handler.outArrow.show();
        handler.inArrow.show();
        return this;
    },
    /**
     * 隐藏插件
     * @function
     * @name Neter.ToolTips.prototype.hide
     * @return {Neter.ToolTips} 返回插件的引用
     */
    hide : function() {
        var handler = this.handler;

        Neter.Box.prototype.hide.apply(this, arguments);

        handler.outArrow.hide();
        handler.inArrow.hide();

        return this;
    }
});