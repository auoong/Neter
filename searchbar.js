/**
 * 搜索条插件
 * @author Ly
 * @date 2012/11/15
 */
;Neter.namespace('Neter.SearchBar');

/**
 * @class
 * @requires Neter.Box
 * @name Neter.SearchBar
 * @param {Object} options 自定义配置信息
 <pre>
 options = {
    container           : document.body,       // 搜索条容器
    width               : 240,                 // 搜索条宽度
    optionsWindowWidth  : 300,                 // 下拉选项框的宽度
    optionsWindowHeight : 200,                 // 下拉选项框的高度
    alignment           : 'left',              // 对齐方式，默认为left，仅支持left/right
    placeholder         : '关键字',            // 搜索框占位符
    keyword             : '',                  // 默认的或者输入的关键字
    optionsWindow       : null,                // 下拉选项内容
    searchEvent         : null                 // 搜索按钮事件
 }
 </pre>
 */
;Neter.SearchBar = function(options) {
    var _this = this;
    
    this.defaults = {
        container           : document.body,       // 搜索条容器
        width               : 240,                 // 搜索条宽度
        optionsWindowWidth  : 300,                 // 下拉选项框的宽度
        optionsWindowHeight : 200,                 // 下拉选项框的高度
        alignment           : 'left',              // 对齐方式，默认为left，仅支持left/right
        placeholder         : '关键字',            // 搜索框占位符
        keyword             : '',                  // 默认的或者输入的关键字
        optionsWindow       : null,                // 下拉选项内容
        searchEvent         : null                 // 搜索按钮事件
    };
    
    Neter.apply(this.defaults, options, {
        // 搜索按钮宽度
        SEARCH_BUTTON_WIDTH              : 44,
        // 关键字框右padding的默认宽度
        KEYWORD_PADDING_RIGHT_WIDTH      : 8,
        // 下拉选项按钮占位宽度
        OPTIONS_BUTTON_PLACEHOLDER_WIDTH : 28
    });
    
    this.handler = {
        container     : $(this.defaults.container),
        searchBar     : null,
        keyword       : null,
        optionsButton : null,
        searchButton  : null,
        box           : null
    };
    
    this.defaults.container = null;
    
    this.method = {
        /**
         * 创建框架
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            // 创建搜索条
            handler.searchBar = $('<div></div>').addClass('neter-search-bar')
                .appendTo(handler.container);
            
            // 创建关键字对象
            handler.keyword = $('<input type="text" />').addClass('netbar-search-bar-keyword')
                .attr('placeholder', defaults.placeholder)
                .appendTo(handler.searchBar);
            
            // 创建下拉选项按钮，默认为隐藏，仅当传递了optionsWindow后才显示
            handler.optionsButton = $('<span></span>').addClass('neter-search-bar-options-button')
                .appendTo(handler.searchBar);
            
            // 创建搜索按钮
            handler.searchButton = $('<button />').addClass('neter-button-primary neter-search-bar-search-button')
                .append($('<b></b>'))
                .appendTo(handler.searchBar);
            
            return this;
        },
        /**
         * 初始化布局
         * @ignore
         */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            // 设置插件宽度
            handler.searchBar.width(defaults.width);
            
            // 当有下拉选项窗口时则要显示下拉按钮
            !defaults.optionsWindow
                ? handler.optionsButton.hide()
                    && handler.keyword.css({ paddingRight : defaults.KEYWORD_PADDING_RIGHT_WIDTH })
                    && handler.keyword.outerWidth(defaults.width - defaults.SEARCH_BUTTON_WIDTH)
                : handler.optionsButton.show()
                    && this.appendOptionsWindow()
                    && handler.keyword.css({ paddingRight : defaults.OPTIONS_BUTTON_PLACEHOLDER_WIDTH });
            
            // 设置关键字文本框的大小
            handler.keyword.outerWidth(defaults.width - defaults.SEARCH_BUTTON_WIDTH);
            
            // 设置下拉选项按钮的位置
            handler.optionsButton.css({ right : defaults.SEARCH_BUTTON_WIDTH });
            
            return this;
        },
        /**
         * 绑定插件中的事件
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            handler.searchBar
            .click(function(event) { event.stopPropagation(); })
            // 下拉选项按钮事件
            .on('click', '.neter-search-bar-options-button', function() {
                var offset = handler.searchBar.offset();
                offset.left = defaults.alignment == 'right'
                                ? offset.left - (handler.box.get().outerWidth() - handler.searchBar.outerWidth())
                                : offset.left;
                offset.top = offset.top + handler.searchBar.outerHeight();
                
                handler.box.show(offset.left, offset.top);
            })
            // 搜索按钮事件
            .on('click', '.neter-search-bar-search-button', function(event) {
                defaults.searchEvent
                    && typeof defaults.searchEvent === 'function'
                    && defaults.searchEvent.call(this, _this, handler.keyword, event);
            });
            
            return this;
        },
        /**
         * 增加下拉选项
         * @ignore
         */
        appendOptionsWindow : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            if (!defaults.optionsWindow) { return this; }
            
            handler.box = new Neter.Box({
                    width      : defaults.optionsWindowWidth,
                    height     : defaults.optionsWindowHeight,
                    content    : defaults.optionsWindow,
                    closeEvent : function(box) {
                        // 单击关闭按钮仅是用来隐藏窗口
                        box.hide();
                        return false;
                    }
                })
                .render(false);
            
            // 取消下拉选项框中单击事件的冒泡
            handler.box.get().click(function(event) { event.stopPropagation(); });
            
            return this;
        }
    };
};

;Neter.apply(Neter.SearchBar.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.SearchBar.prototype.render
     * @return {Neter.SearchBar} 返回插件的引用
     */
    render : function() {
        if (!Neter.Box) {
            Neter.log('未导入Neter.Box插件，不支持optionsWindow参数。', 'warn');
            return this;
        }
        this.method.create().initLayout().bindEvents();
        
        return this;
    },
    /**
     * 获取插件的DOM对象

     * @function
     * @name Neter.SearchBar.prototype.get
     * @return {jQueryDOM} 插件的DOM对象，经过jQuery封装过的。
     */
    get : function() {
        return this.handler.searchBar;
    },
    /**
     * 设置或获取搜索条的默认内容
     * @function
     * @name Neter.SearchBar.prototype.keyword
     * @param {String} [keyword] 要设置的搜索内容，活力则获取当前输入的关键字
     * @return {String|Number|Neter.SearchBar} 当传递了keyword则返回插件引用，否则返回当前的关键字内容
     */
    keyword : function(keyword) {
        if (arguments.length) {
            this.handler.keyword.val(this.defaults.keyword = typeof keyword === 'undefined' ? '' : keyword);
        } else {
            return this.handler.keyword.val();
        }
        
        return this;
    },
    /**
     * 设置或获取搜索条的占位符
     * @function
     * @name Neter.SearchBar.prototype.placeholder
     * @param {String} [msg] 占位符内容
     * @return {Neter.SearchBar} 返回插件的引用
     */
    placeholder : function(msg) {
        if (arguments.length == 0) {
            this.handler.keyword.attr('placeholder', this.defaults.placeholder = typeof msg === 'undefined' ? '' : msg);
        } else {
            return this.handler.keyword.attr('placeholder');
        }
        
        return this;
    },
    /**
     * 若搜索条有下拉选项，则打开
     * @function
     * @name Neter.SearchBar.prototype.showOptionsWindow
     * @return {Neter.SearchBar} 返回插件的引用
     */
    showOptionsWindow : function() {
        this.handler.box && this.handler.box.show();
        
        return this;
    },
    /**
     * 隐藏搜索条下拉选项
     * @function
     * @name Neter.SearchBar.prototype.hideOptionsWindow
     * @return {Neter.SearchBar} 返回插件的引用
     */
    hideOptionsWindow : function() {
        this.handler.box && this.handler.box.hide();
        
        return this;
    },
    /**
     * 删除下拉选项，与hideOptionsWindow不同之处在于，删除后不再保留搜索条右侧的下拉箭头
     * @function
     * @name Neter.SearchBar.prototype.removeOptionsWindow
     * @return {Neter.SearchBar} 返回插件的引用
     */
    removeOptionsWindow : function() {
        this.handler.box.remove();
        this.handler.box = null;
        
        this.defaults.optionsWindow = null;
        
        this.method.initLayout();
        
        return this;
    },
    /**
     * 更新下拉选项内容
     * @param {HTMLElement} content 用于更新下拉选项的HTML对象
     * @function
     * @name Neter.SearchBar.prototype.updateOptionsWindow
     * @return {Neter.SearchBar} 返回插件的引用
     */
    updateOptionsWindow : function(content) {
        this.defaults.optionsWindow = content;
        
        this.method.initLayout();
        
        this.handler.box
            ? this.handler.box.content(content)
            : this.method.appendOptionsWindow();
        
        return this;
    },
    /**
     * 重新设置搜索按钮的事件
     * @param {Function} handler 搜索按钮要响应的事件
     * @function
     * @name Neter.SearchBar.prototype.updateSearchEvent
     * @return {Neter.SearchBar} 返回插件的引用
     */
    updateSearchEvent : function(handler) {
        this.defaults.searchEvent = typeof handler === 'function' ? handler : null;
        
        return this;
    }
});