/**
 * 信息提示插件
 * @author Ly
 * @date 2012/11/15
 */
;Neter.namespace('Neter.Tips');

/**
 * @class
 * @name Neter.Tips
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    container : document.body,            // 信息提示框架放于哪个容器中进行显示，默认为body
    msg       : '',                       // 信息内容
    showTime  : 2000,                     // 提示信息显示时间，单位秒，默认为2000毫秒
    type      : 'success'                 // 提示框类型，success（绿色）、error（红色）、aside（灰色）、warning（棕色）
 }
 </pre>
 */
;Neter.Tips = function(options) {
    var _this = this;
    
    this.defaults = {
        container : document.body,            // 信息提示框架放于哪个容器中进行显示，默认为body
        msg       : '',                       // 信息内容
        showTime  : 2000,                     // 提示信息显示时间，单位秒，默认为2000毫秒
        type      : 'success'                 // 提示框类型，success（绿色）、error（红色）、aside（灰色）、warning（棕色）
    };
    
    Neter.apply(this.defaults, options);
    
    this.handler = {
        container : $(this.defaults.container),
        tips      : null
    };
    
    this.method = {
        /**
         * 创建框架
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            handler.tips = $('<div></div>').addClass('neter-tips')
                .html(defaults.msg)
                .appendTo(defaults.container);
            
            return this;
        }
    };
};

;Neter.apply(Neter.Tips.prototype, {
    /**
     * 渲染插件，渲染后仅是将插件添加到页面中，若要显示需调用show方法
     * @function
     * @name Neter.Tips.prototype.render
     * @return {Neter.Tips} 返回插件的引用
     */
    render : function() {
        this.method.create();
        
        return this;
    },
    /**
     * 获取插件的DOM对象
     * @function
     * @name Neter.Tips.prototype.get
     * @return {jQueryDOM} 返回当前插件的DOM对象，经过jQuery封装过。
     */
    get : function() {
        return this.handler.tips;
    },
    /**
     * 更新插件的消息内容
     * @function
     * @name Neter.Tips.prototype.update
     * @param {String} msg 消息内容
     * @return {Neter.Tips} 返回插件的引用
     */
    update : function(msg) {
        this.defaults.msg = msg || this.defaults.msg;
        
        return this;
    },
    /**
     * 显示插件
     * @function
     * @name Neter.Tips.prototype.show
     * @param {String} [type] 指定信息框的类型，可以省略，省略则使用上次设置的类型
     * @param {Boolean} [showType=false] 显示方式，默认为false，即以动画方式来显示，true为立即显示，并且不自动隐藏
     * @return {Neter.Tips} 返回插件的引用
     */
    show : function(type, showType) {
        var defaults = this.defaults,
            tips     = this.handler.tips;
        
        if (!tips) { return this; }
        
        defaults.type = type || defaults.type;
        
        tips.html(defaults.msg)
            .removeClass('neter-tips-success neter-tips-error neter-tips-aside neter-tips-warning')
            .addClass('neter-tips-' + defaults.type)
            .css({ marginLeft : -tips.outerWidth() / 2 });
        
        if (showType) {
            tips.css({ top : 0 }).show();
        } else {
            tips.animate({ top : 0 })
                .delay(defaults.showTime)
                .animate({ top : -tips.outerHeight() }, 'slow');
        }
        
        return this;
    },
    /**
     * 隐藏插件
     * @function
     * @name Neter.Tips.prototype.hide
     * @return {Neter.Tips} 返回插件的引用
     */
    hide : function() {
        this.handler.tips && this.handler.tips.animate({ top : -this.handler.tips.outerHeight() }, 'slow');
        
        return this;
    },
    /**
     * 删除插件，删除后不能再调用show进行显示
     * @function
     * @name Neter.Tips.prototype.remove
     * @return {Object} 返回null
     */
    remove : function() {
        this.handler.tips.empty().remove();
        this.handler.tips = null;

        return null;
    }
});