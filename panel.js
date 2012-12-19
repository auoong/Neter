/**
 * 面板插件，支持多标签，很像TabPanel，但与之不同的在于标签宽度是平分
 * 并且不支持url，内容仅能为html（当然，可以自己在此基础之上进行扩展）
 * @author Ly
 * @date 2012/11/14
 */
;Neter.namespace('Neter.Panel');

/**
 * @class
 * @name Neter.Panel
 * @param {Object} options 自定义配置信息
 <pre>
 options = {
    width      : 340,
    height     : 390,
    defaultTag : 0,
    container  : document.body,     // 面板容器，即将面板放于哪个元素之内，默认为body
    bodies     : [{                 // 面板主体，至少包含一个元素
        tag        : '',
        content    : ''
    }],
    activeType : 'hover'            // 激活标签的方式，hover/click，默认为hover,即鼠标滑过则切换
 }
 </pre>
 */
;Neter.Panel = function(options) {
    var _this = this;
    
    this.defaults = {
        width      : 340,
        height     : 390,
        defaultTag : 0,
        container  : document.body,     // 面板容器，即将面板放于哪个元素之内，默认为body
        bodies     : [{                 // 面板主体，至少包含一个元素
            tag     : '',
            content : ''
        }],
        activeType : 'hover'            // 激活标签的方式，hover/click，默认为hover,即鼠标滑过则切换
    };
    
    Neter.apply(this.defaults, options, {
        // 边框宽度
        BORDER_WIDTH : 2
    });
    
    this.handler = {
        container     : $(this.defaults.container),
        panel         : null,
        tagBar        : null,
        viewContainer : null,
        bodies        : [],
        previous      : {
            tag  : null,
            view : null
        }
    };
    
    this.defaults.container = null;
    
    this.method = {
        /**
         * 创建插件框架
         * @ignore
         */
        create : function() {
            var defaults  = _this.defaults,
                handler   = _this.handler;
            
            // 创建面板容器
            handler.panel = $('<div></div>').addClass('neter-panel')
                .appendTo(handler.container);
            
            // 创建标签栏
            handler.tagBar = $('<div></div>').addClass('neter-panel-tag-bar')
                .appendTo(handler.panel);
            
            // 创建主体
            handler.viewContainer = $('<div></div>').addClass('neter-panel-view-container')
                .appendTo(handler.panel);
            
            return this;
        },
        /**
         * 初始化布局，当添加与删除标签时也需要调用此方法来重新进行页面布局初始化
         * @ignore
         */
        initLayout : function() {
            var defaults      = _this.defaults,
                handler       = _this.handler,
                width         = defaults.width - defaults.BORDER_WIDTH,
                height        = defaults.height - defaults.BORDER_WIDTH,
                tagBar        = handler.tagBar.css({ width : width }),
                bodies        = handler.bodies,
                tagWidth      = tagBar.width() / bodies.length,
                viewContainer = handler.viewContainer;
            
            handler.panel.css({ width : width, height : height });
            
            handler.viewContainer.css({
                width  : width,
                height : height - tagBar.outerHeight()
            });
            
            $.each(bodies, function(index, value) {
                value.tag.css({ borderRightWidth : '1px', width : tagWidth - 1 });
            });
            
            tagBar.find('.neter-panel-tag:last').css({
                borderRightWidth : 0,
                width            : tagWidth
            });
            
            return this;
        },
        /**
         * 插入面板标签，如果参数都省略，则取this.defaults.bodies中的内容
         * @ignore
         * @param {Number} index 新加入的标签位置，值为-1时直接添加到最后
         * @param {Object} options 新加入的内容，{ tag : '', content : '' }
         */
        insert : function(index, options) {
            var defaults      = _this.defaults,
                handler       = _this.handler,
                tagBar        = handler.tagBar,
                viewContainer = handler.viewContainer,
                bodies        = handler.bodies;
            
            arguments.length && defaults.bodies.push(options);
            
            $.each(defaults.bodies, function(i, options) {
                var tag = $('<div></div>').addClass('neter-panel-tag').html(options.tag),
                    view = $('<div></div>').addClass('neter-panel-view').append(options.content);
                
                if (typeof index === 'number') {
                    index = !~index ? bodies.length : index;
                    var tmp = tagBar.find('.neter-panel-tag')[index];
                    
                    tmp ? tag.insertBefore(tmp) : tagBar.append(tag);
                    
                    (tmp = viewContainer.find('.neter-panel-view')[index])
                        ? view.insertBefore(tmp)
                        : viewContainer.append(view);
                    
                    bodies.splice(index, 0, { tag : tag, view : view, options : options });
                } else {
                    tagBar.append(tag);
                    viewContainer.append(view);
                    bodies.splice(i, 0, { tag : tag, view : view, options : options });
                }
            });
            
            defaults.bodies = [];
            
            return this;
        },
        /**
         * 更新标签内容
         * @ignore
         * @param {Number} index 要更新的标签所处的位置
         * @param {Object} options 新标签的内容，{tag : '', content : '' }
         */
        update : function(index, options) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                dest     = handler.bodies[index];
            
            if (dest) {
                dest.tag.html(options.tag);
                dest.view.empty().append(options.content);
                dest.options = options;
            }
            
            return this;
        },
        /**
         * 删除指定的标签
         * @ignore
         * @param {Number} index 要删除的标签，可一次性删除多个标签
         */
        remove : function(index) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                dest     = handler.bodies[index];
            
            if (dest) {
                dest.tag.remove();
                dest.view.empty().remove();
                
                handler.bodies[index].tag  = null;
                handler.bodies[index].view = null;
                handler.bodies.splice(index, 1);
            }
            
            return this;
        },
        /**
         * 给标签绑定切换事件，至于激活标签的方式由this.defaults.activeType来指定
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                current  = handler.current;
            
            handler.tagBar.on(defaults.activeType, 'div.neter-panel-tag', function() {
                _this.method.active(this);
            });
            
            return this;
        },
        /**
         * 激活标签
         * @ignore
         * @param {HTMLElement} current 要切换到的标签，是一个dom对象
         */
        active : function(current) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                previous = handler.previous;
            
            previous.tag && previous.tag.removeClass('neter-panel-tag-current');
            previous.view && previous.view.hide();
            
            previous.tag = $(current).addClass('neter-panel-tag-current');
            
            $.each(handler.bodies, function(index, value) {
                if (value.tag.get(0) === current) {
                    previous.view = value.view.show();
                }
            });
            
            return this;
        }
    };
};

;Neter.apply(Neter.Panel.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.Panel.prototype.render
     * @return {Neter.Panel} 返回插件引用
     */
    render : function() {
        this.method.create().insert().initLayout().bindEvents();
        
        this.active(this.defaults.defaultTag);
        
        return this;
    },
    /**
     * 获取Panel本身
     * @function
     * @name Neter.Panel.prototype.get
     * @return {jQueryDOM} 返回插件DOM对象，经过jQuery封装。
     */
    get : function() {
        return this.handler.panel;
    },
    /**
     * 获取Panel视图
     * @function
     * @name Neter.Panel.prototype.getView
     * @return {jQueryDOM} 返回插件视图DOM对象，经过jQuery封装。
     */
    getView : function() {
        return this.handler.viewContainer;
    },
    /**
     * 激活标签
     * @function
     * @name Neter.Panel.prototype.active
     * @param {Number} [index=0] 要激活的标签，从0开始，默认为0
     * @return {Neter.Panel} 返回插件引用
     */
    active : function(index) {
        this.method.active(this.handler.tagBar.find('>div').get(index || 0));
        
        return this;
    },
    /**
     * 插入一个标签，默认为放在最后
     * @function
     * @name Neter.Panel.prototype.insert
     * @param {Number} index 新加入的标签位置，默认为最后
     * @param {Object} options 新加入的内容，{ tag : '', content : '' }
     * @return {Neter.Panel} 返回插件引用
     */
    insert : function(index, options) {
        // 当仅有一个options参数时
        if (typeof index == 'object') {
            index   = -1;
            options = index;
        }
        index = typeof index === 'number' ? index : -1;
        
        if (!options || !options.hasOwnProperty('tag') || !options.hasOwnProperty('content')) { return this; }
        
        this.method.insert(index, options).initLayout();
        
        return this;
    },
    /**
     * 更新标签内容
     * @function
     * @name Neter.Panel.prototype.update
     * @param {Number} index 要更新的标签所处的位置
     * @param {Object} options 新标签的内容，{tag : '', content : '' }
     * @return {Neter.Panel} 返回插件引用
     */
    update : function(index, options) {
        if (index < 0 || !options || !options.hasOwnProperty('tag') || !options.hasOwnProperty('content')) { return this; }
        
        this.method.update(index, options);
        
        return this;
    },
    /**
     * 删除指定的标签
     * @function
     * @name Neter.Panel.prototype.remove
     * @param {Number} index 要删除的标签，可一次性删除多个标签
     * @return {Object} null
     */
    remove : function(index) {
        var _this = this;
        $.each([].slice.call(arguments, 0).sort().reverse(), function(i, index) {
            index > -1 && _this.method.remove(index);
        });
        
        this.method.initLayout();
        
        // 删除标签后，切换到当前的标签，这样可以使得删除当前标签后不至于没有被显示的标签
        this.active(this.defaults.defaultTag);
        
        return null;
    }
});