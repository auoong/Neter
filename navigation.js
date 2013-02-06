/**
 * 标签式导航插件
 * @author Ly
 * @date 2012/11/20
 */
;Neter.namespace('Neter.Navigation');

/**
 * @class
 * @name Neter.Navigation
 * @param {Object} options 自定义配置信息
 <pre>
 options = {
    // 插件容器，默认为document.body
    container        : document.body,
    // 是否显示选项状态，默认false
    optionsStatus    : false,
    // 视图，即内容或url内容的显示区域
    view             : document.body,
    // 导航项集合
    // 当url参数存在时，屏蔽content参数
    // cache参数仅对url有效。默认开启缓存
    // [{
    //      name              : '导航项名称',
    //      title             : '鼠标悬停时的提示信息',
    //      content           : '对应的内容',
    //      url               : '对应的url',
    //      cache             : true,
    //      reload            : '激活时是否总是加载新的页面，默认为true',
    //      front             : '前置对象',
    //      rear              : '后置对象',
    //      active            : false,
    //      removedActiveItem : '删除此项后需激活的项名称',
    //      closeButton       : false
    //  }]
    items            : [],
    // 导航项默认宽度，即最大宽度
    itemWidth        : 91,
    // 导航项事件
    itemEvent        : null,
    // 删除导航项事件，返回false时不删除
    removeItemEvent  : null,
    // 导航选项菜单项
    // [{
    //      name : '菜单名称',
    //      front : '前置对象',
    //      rear : '后置对象'
    //  }]
    optionsMenu      : [],
    // 导航选项菜单项事件
    optionsMenuEvent : null
 }
 </pre>
 */
;Neter.Navigation = function(options) {
    var _this = this;
    
    this.defaults = {
        // 插件容器，默认为document.body
        container        : document.body,
        // 是否显示选项状态，默认false
        optionsStatus    : false,
        // 视图，即内容或url内容的显示区域
        view             : document.body,
        // 导航项集合
        // 当url参数存在时，屏蔽content参数
        // cache参数仅对url有效。默认开启缓存
        // [{
        //      name              : '导航项名称',
        //      title             : '鼠标悬停时的提示信息',
        //      content           : '对应的内容',
        //      url               : '对应的url',
        //      cache             : true,
        //      reload            : '激活时是否总是加载新的页面，默认为true',
        //      front             : '前置对象',
        //      rear              : '后置对象',
        //      active            : false,
        //      removedActiveItem : '删除此项后需激活的项名称',
        //      closeButton       : false
        //  }]
        items            : [],
        // 导航项默认宽度，即最大宽度
        itemWidth        : 91,
        // 导航项事件
        itemEvent        : null,
        // 删除导航项事件，返回false时不删除
        removeItemEvent  : null,
        // 导航选项菜单项
        // [{
        //      name : '菜单名称',
        //      front : '前置对象',
        //      rear : '后置对象'
        //  }]
        optionsMenu      : [],
        // 导航选项菜单项事件
        optionsMenuEvent : null,
        // 导航项样式列表
        itemCssList : ['neter-navigation-item',
            'neter-navigation-item-hover',
            'neter-navigation-item-active',
            'neter-navigation-item-selected'].join(' '),
        // 关闭按钮样式列表
        closeButtonCssList : ['neter-navigation-item-close-button',
            'neter-navigation-item-close-button-hover',
            'neter-navigation-item-close-button-active',
            'neter-navigation-item-close-button-selected'].join(' ')
    };
    
    Neter.apply(this.defaults, options);
    
    this.handler = {
        container    : this.defaults.container,
        view         : this.defaults.view,
        navigation   : null,                        // 导航对象
        ul           : null,                        // 导航项容器
        separator    : null,                        // 导航条分隔线
        dropDownMenu : null,                        // 导航选项菜单
        items        : []                           // 导航项对象缓存
    };
    
    this.defaults.container = null;
    this.defaults.view      = null;
    
    this.method = {
        /**
         * 获取导航项配置信息
         * @ignore
         * @param {Number|String|HTMLElement} item 要查找的导航项索引值，或名称，或DOM对象
         */
        getOptions : function(item) {
            var items = _this.handler.items;
            
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = null;
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? items[i] : null;
                        break;
                    case 'string':
                        ret = items[i].name === item ? items[i] : null;
                        break;
                    case 'number':
                        ret = String(i) === String(item) ? items[i] : null;
                        break;
                }
                
                if (ret) { return ret; }
            }
            
            return null;
        },
        /**
         * 获取导航项索引值
         * @ignore
         * @param {Number|String|HTMLElement} item 要查找的导航项索引值，或名称，或DOM对象
         * @return {Number} item对应的索引值，-1为未找到
         */
        getIndex : function(item) {
            var items = _this.handler.items;
            
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = -1;
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? i : -1;
                        break;
                    case 'string':
                        ret = items[i].name === item ? i : -1;
                        break;
                    case 'number':
                        return item >= len ? len - 1 : item;
                        break;
                }
                
                if (~ret) { return ret; }
            }
            
            return -1;
        },
        /**
         * 创建框架
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            // 创建导航对象
            handler.navigation = $('<div></div>').addClass('neter-navigation')
                .appendTo(handler.container);
            
            // 创建导航项容器
            handler.ul = $('<ul></ul>').addClass('neter-navigation-ul')
                .appendTo(handler.navigation);
            
            // 创建选项菜单按钮
            handler.dropDownMenu = new Neter.DropDownMenu({
                alignment  : 'right',
                trigger    : $('<li></li>').addClass('neter-navigation-item neter-navigation-item-options-menu-button')
                            [defaults.optionsMenu && defaults.optionsMenu.length ? 'show' : 'hide']()
                            .append($('<b></b>'))
                            .click(function(event) { event.stopPropagation(); })
                            .appendTo(handler.ul),
                mode       : 'click',
                showStatus : defaults.optionsStatus,
                items      : defaults.optionsMenu,
                menuEvent  : function(dropDownMenu, options, event) {
                    if (typeof defaults.optionsMenuEvent === 'function') {
                        defaults.optionsMenuEvent.call(this, _this, Neter.apply({}, options, ['el', 'view']), event) !== false && dropDownMenu.hide();
                    } else {
                        dropDownMenu.hide();
                    }
                }
            }).render();
            
            // 创建导航分隔线
            handler.separator = $('<div></div>').addClass('neter-navigation-separator')
                .appendTo(handler.navigation);
            
            return this;
        },
        /**
         * 初始化布局
         * @ignore
         */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                // 计算导航项宽度
                width    = (handler.ul.width() - handler.ul.children().last().outerWidth()) / (handler.ul.children().length || 1) - 28;
            
            // 若导航项宽度大于默认宽度则设置为默认宽度
            width = width > defaults.itemWidth ? defaults.itemWidth : width;
            
            // 设置导航项宽度
            handler.ul.children('.neter-navigation-item-flag').width(width).css({ marginLeft : -1 }).first().css({ marginLeft : 0 });
            
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
            
            handler.ul
            // 导航项单击事件
            .on('click', 'li.neter-navigation-item-flag', function(event) {
                var index = $(this).index(),
                    options = method.getOptions(index) || {};
                
                method.active(index, options.reload, event);
                
                options = null;
            })
            .on('mouseenter', '.neter-navigation-item-flag,.neter-navigation-item-options-menu-button', function() {
                $(this).hasClass('neter-navigation-item-selected')
                || $(this).removeClass('neter-navigation-item')
                          .addClass('neter-navigation-item-hover');
            })
            .on('mouseleave', '.neter-navigation-item-flag,.neter-navigation-item-options-menu-button', function() {
                $(this).removeClass('neter-navigation-item-hover')
                       .hasClass('neter-navigation-item-selected')
                || $(this).addClass('neter-navigation-item')
            })
            // 导航项关闭按钮事件
            .on('click', '.neter-navigation-item-close-button-flag', function(event) {
                var parent = $(this).parents('.neter-navigation-item-flag'),
                    index  = parent.index();
                
                _this.remove(index);
                
                event.stopPropagation();

                parent = null;
            })
            .on('mouseenter', '.neter-navigation-item-close-button-flag', function() {
                $(this).removeClass('neter-navigation-item-close-button')
                       .addClass('neter-navigation-item-close-button-hover');
            })
            .on('mouseleave', '.neter-navigation-item-close-button-flag', function() {
                var self = $(this);
                self.removeClass('neter-navigation-item-close-button-hover');

                if (self.parent().parent().hasClass('neter-navigation-item-selected')) {
                    self.addClass('neter-navigation-item-selected-close-button');
                } else {
                    self.addClass('neter-navigation-item-close-button');
                }
            });
            
            // 给body绑定关闭下拉选项菜单事件
            $('body').live('click', function() {
                handler.dropDownMenu.hide();
            });
            
            return this;
        },
        /**
         * 插入一个导航项
         * @ignore
         * @param {Number} index 要插入的位置
         * @param {Object} options 导航项配置信息
            options = {
                name        : '导航项名称',
                title       : '鼠标悬停时的提示信息',
                content     : '对应的内容',
                url         : '对应的url',
                cache       : true,
                reload      : '激活时是否总是加载新的页面，默认为true',
                front       : '前置对象',
                rear        : '后置对象',
                active      : false,
                closeButton : false
            }
         */
        insert : function(index, options) {
            if (!options.name) {
                Neter.log('Navigation.insert操作被取消，导航项参数name为空！', 'warn');
                
                return this;
            }
            
            var defaults = _this.defaults,
                handler  = _this.handler,
                children = null,
                item     = $('<li></li>').addClass('neter-navigation-item neter-navigation-item-flag'),
                view     = $('<div></div>').addClass('neter-navigation-view').appendTo(handler.view);
            
            // 修正index=-1时的插入位置
            index = index < 0 ? handler.ul.children().length - 1 : index;
            
            // 创建导航项
            // 包含三个区域，前置区域，用于用户自定义图标或做其他用；名称，即导航项名称；后置区域，默认用来显示关闭按钮，也可用户自定义。
            item.append($('<span></span>').addClass('neter-navigation-item-front').append(options.front || null))
                .append($('<span></span>').addClass('neter-navigation-item-name').attr('title', options.title || options.name.replace(/<.*$/, '')).html(options.name))
                .append($('<span></span>').addClass('neter-navigation-item-rear'));
            
            children = item.children();
            
            // 检测是否需要显示前置与后置对象
            options.front && children.first().show();
            options.rear
                ? children.last().empty().append(options.rear).show()
                : children.last()
                    .append($('<a href="###"></a>').addClass('neter-navigation-item-close-button neter-navigation-item-close-button-flag')
                        .append($('<b>x</b>')));
            
            options.closeButton && children.last().show();
            
            item.insertBefore(handler.ul.children().get(index));
            
            // 将当前项缓存
            handler.items.splice(index, 0 , Neter.apply({}, options, { el : item, view : view }));
            
            // 检测是否需要激活当前项
            options.active && this.active(index, true);

            defaults = handler = children = item = view = null;
            
            return this;
        },
        /**
         * 激活一个导航项
         * @ignore
         * @param {Number|String|HTMLElement} index 要激活的项索引值或者名称或导航项对象
         * @param {Boolean} reload 激活时是否重新加载视图内容
         */
        active : function(index, reload, event) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this,
                argLen   = arguments.length;
            
            $.each(_this.handler.items, function(i, item) {
                if (item === index || (typeof index === 'number' ? index == i : index == item.name)) {
                    method.loadData(item.view, item.content, item.url, item.cache, argLen >= 2 ? reload : item.reload);
                    
                    item.view.show();
                    item.el.removeClass(defaults.itemCssList)
                           .addClass('neter-navigation-item-selected')
                           .find('.neter-navigation-item-close-button-flag')
                                .removeClass('neter-navigation-item-close-button neter-navigation-item-close-button-hover')
                                .addClass('neter-navigation-item-selected-close-button');
                    item.active = true;
                    
                    // 激活后执行导航条事件
                    typeof defaults.itemEvent === 'function'
                        && defaults.itemEvent.call(item.el, _this, Neter.apply({}, item, ['el', 'view']), event);
                } else {
                    item.view.hide();
                    item.el.removeClass('neter-navigation-item-selected')
                           .addClass('neter-navigation-item')
                           .find('.neter-navigation-item-selected-close-button')
                                .removeClass('neter-navigation-item-selected-close-button')
                                .addClass('neter-navigation-item-close-button');
                    item.active = false;
                }
            });

            defaults = handler = method = null;
            
            return this;
        },
        /**
         * 加载视图数据
         * @ignore
         * @param {HTMLElement} view 视图区域
         * @param {String} content 要显示的内容，或者是需加载的url
         * @param {String} url 要显示的内容所在的文件，当此参数存在时content参数被屏蔽掉
         * @param {Boolean} cache 是否允许从缓存中加载url，默认为true
         * @param {Boolean} reload 是否重新渲染视图，默认为true
         */
        loadData : function(view, content, url, cache, reload) {
            if (view.html() != '' && !reload) { return this; }

            if (url) {
                var params = cache ? { v : Math.random() } : {};
                $.get(url, params, function(data) { view.empty().html(data); }, 'html');
            } else {
                view.empty().html(content);
            }
            
            return this;
        }
    };
};

;Neter.apply(Neter.Navigation.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.Navigation.prototype.render
     * @return {Neter.Navigation} 返回插件引用
     */
    render : function() {
        var method = this.method;
        
        method.create().initLayout().bindEvents();
        
        (!this.defaults.items || this.defaults.items.length < 1) &&  Neter.log('Neter.Navigation渲染完成，但未指定导航项...');
        
        // 初始化导航项
        $.each(this.defaults.items, function(index, item) {
            method.insert(-1, item);
        });
        
        method.initLayout();
        
        return this;
    },
    /**
     * 获取插件的DOM对象
     * @function
     * @name Neter.Navigation.prototype.get
     * @return {jQueryDOM} 经过jQuery封装过的插件对象
     */
    get : function() {
        return this.handler.navigation;
    },
    /**
     * 插入一个导航项
     * @function
     * @name Neter.Navigation.prototype.insert
     * @param {Number} index 要插入的位置
     * @param {Object} options 导航项配置信息
     <pre>
        options = {
            name              : '导航项名称',
            title             : '鼠标悬停时的提示信息',
            content           : '对应的内容',
            url               : '对应的url',
            cache             : true,
            reload            : '激活时是否总是加载新的页面，默认为true',
            front             : '前置对象',
            rear              : '后置对象',
            active            : false,
            removedActiveItem : '删除此项后需激活的项名称',
            closeButton       : false
        }
    </pre>
     * @return {Neter.Navigation} 返回插件引用
     */
    insert : function(index, options) {
        index = this.getIndex(index);
        this.method.insert(index < -1 ? -1 : index, options).initLayout();
        
        return this;
    },
    /**
     * 更新一个导航项
     * @function
     * @name Neter.Navigation.prototype.update
     * @param {Number|String|HTMLElement} item 要查找的导航项索引值，或名称，或DOM对象
     * @param {Object} options 导航项配置信息
     <pre>
        options = {
            name              : '导航项名称',
            title             : '鼠标悬停时的提示信息',
            content           : '对应的内容',
            url               : '对应的url',
            cache             : true,
            front             : '前置对象',
            rear              : '后置对象',
            reload            : '激活时是否总是加载新的页面，默认为true'
            active            : false,
            removedActiveItem : '删除此项后需激活的项名称',
            closeButton       : false
        }
        </pre>
     * @return {Neter.Navigation} 返回插件引用
     */
    update : function(index, options) {
        var current = this.method.getOptions(this.getIndex(index));
        
        if (current) {
            var el       = current.el,
                children = el.children();
            
            options.front && children.first().empty().append(options.front);
            
            // 如果当前的菜单项有子菜单项，则不可以添加后置对象
            options.rear && children.last().empty().append(options.rear).show();
            
            options.name !== current.name && el.children('.neter-navigation-item-name').attr('title', options.title || options.name.replace(/<.*$/, '')).html(options.name);
            
            children.last()[options.closeButton ? 'show' : 'hide']();
            
            this.method.loadData(current.view, current.content, current.url, current.cache, options.reload);
            
            Neter.apply(current, options);
        }
        
        return this;
    },
    /**
     * 删除指定的导航项，若被删除的导航项处于被激活状态，则自动激活当前左侧的项
     * @function
     * @name Neter.Navigation.prototype.remove
     * @param {Number|String|HTMLElement} [item] 要删除的导航项的索引位置，或导航项名称，或导航项对象，支持多个参数
     * @return {Neter.Navigation} 返回插件引用
     */
    remove : function(item /* , [item, ...] */) {
        var auto     = false,
            _this    = this,
            method   = this.method,
            defaults = this.defaults,
            items    = this.handler.items,
            // 组织要删除的导航项，如果没有参数则取所有的导航项作为备选删除项
            index    = arguments.length
                        ? $.map([].slice.call(arguments, 0), function(n, i) { return method.getIndex(n); }).sort().reverse()
                        : $.map(new Array(items.length), function(n, i) { return i; }).reverse(),
            minIndex = Math.min.apply(null, index),

            // 要激活的项，用于删除后手动指定激活项，若没有则激活最小项左边的
            activeItem = '';
        
        $.each(index, function(index, item) {
            index = item;
            if (!~item) { return ; }
            
            item = items[index];
            
            // 仅能删除带有关闭按钮的项
            if (item && item.closeButton) {
                var flag = true;
                if (typeof defaults.removeItemEvent === 'function') {
                    // 仅当删除项事件返回false时才不删除导航项
                    flag = defaults.removeItemEvent.call(item.el, _this, Neter.apply({}, item, ['el', 'view'])) !== false;
                }
                
                if (!flag) { return ; }
                
                auto = auto || item.el.hasClass('neter-navigation-item-selected');

                activeItem = item.removedActiveItem || '';

                item.el.empty().remove() && item.view.empty().remove();
                
                item.el    = null;
                item.front = null;
                item.rear  = null;
                item.view  = null;
                
                items.splice(index, 1);
            }
        });

        this.method.initLayout();
        
        // 自动激活被删除项左侧的项

        auto && this.active(activeItem || Math.max(0, minIndex - 1));
        
        return this;
    },
    /**
     * 更新导航项事件
     * @function
     * @name Neter.Navigation.prototype.updateItemEvent
     * @param {Function} handler 新的导航项事件
     * @return {Neter.Navigation} 返回插件引用
     */
    updateItemEvent : function(handler) {
        typeof handler === 'function' && (this.defaults.itemEvent = handler);
        
        return this;
    },
    /**
     * 更新删除导航项事件
     * @function
     * @name Neter.Navigation.prototype.updateRemoveItemEvent
     * @param {Function} handler 新的删除导航项事件
     * @return {Neter.Navigation} 返回插件引用
     */
    updateRemoveItemEvent : function(handler) {
        typeof handler === 'function' && (this.defaults.removeItemEvent = handler);
        
        return this;
    },
    /**
     * 更新选项菜单事件
     * @function
     * @name Neter.Navigation.prototype.updateOptionsMenuEvent
     * @param {Function} handler 新的选项菜单事件
     * @return {Neter.Navigation} 返回插件引用
     */
    updateOptionsMenuEvent : function(handler) {
        typeof handler === 'function' && (this.defaults.optionsMenuEvent = handler);
        
        return this;
    },
    /**
     * 激活指定的导航项
     * @function
     * @name Neter.Navigation.prototype.active
     * @param {Number|String|HTMLElement} index 要激活的项索引值或者名称或导航项对象
     * @param {Boolean} reload 是否重新加载页面，默认为true
     * @param {Object} event 现场事件，此事件会传递给itemEvent(navigation, options, event)事件
     * @return {Neter.Navigation} 返回插件引用
     */
    active : function(index, reload, event) {
        this.method.active.apply(this.method, arguments);
        
        return this;
    },
    /**
     * 触发下拉菜单项事件
     * @function
     * @name Neter.Navigation.prototype.optionsMenuTrigger
     * @return {Neter.Navigation} 返回插件引用
     */
    optionsMenuTrigger : function(method, arg1, arg2 /* ... */) {
        // 若没有下拉选项菜单则直接退出
        if (!this.defaults.optionsMenu || this.defaults.optionsMenu.length < 1) {
            return this;
        }
        if (!arguments.length) {
            Neter.log('Navigation.optionsMenuTrigger方法调用失败，缺少参数method。', 'warn');
            return this;
        }
        var menu = this.handler.dropDownMenu,
            arg  = [].slice.call(arguments, 1);
        
        typeof menu[method] === 'function' && menu[method].apply(menu, arg);
        
        return this;
    },
    /**
     * 获取导航项索引值
     * @function
     * @name Neter.Navigation.prototype.getIndex
     * @param {Number|String|HTMLElement} item 要查找的导航项索引值，或名称，或DOM对象
     * @return {Number} item对应的索引值，-1为未找到
     */
    getIndex : function(item) {
        return this.method.getIndex(item);
    }
});
