/**
 * 触点插件
 * @author Ly
 * @date 2012/11/30
 */
;Neter.namespace('Neter.Dock');

/**
 * @class
 * @name Neter.Dock
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    container    : document.body,
    // 插件显示位置，插件的位置基本固定在左下角
    left         : 14,
    bottom       : 14,
    // 列表中最多显示的应用的个数
    showCount    : 10,
    // 插件显示方式：h-横向显示，v-纵向显示，f-全屏显示
    showType     : 'v',
    // 当前插件的显示模式：list/full
    currentModel : 'list',
    // 是否显示闪烁提示
    blink        : false,
    // 是否支持分组，默认为false，若支持分组则仅按v模式来显示，切不能全屏。
    group        : false,
    // 是否启用flash遮挡
    maskFlash    : false,
    // 应用程序对象数组
    // 格式：{
    //      name  : '应用程序名称',
    //      icon  : '应用程序图标，大小为32x32',
    //      label : '应用程序的标签，主要用于数量的显示，会显示在应用程序的右上角',
    //      data  : '应用程序的数据，不是必须属性',
    //      // data2 : '另一些数据'   所有的配置信息都会在应用程序事件的回调中返回，以被用户使用。
    //  }
    items           : [],
    // 应用程序事件，触发时带有的参数：itemEvent(dock, options, event)
    itemEvent       : null,
    // 应用程序删除事件，触发时带有的参数：itemEvent(dock, options, event)
    removeItemEvent : null
 }
 </pre>
 */
;Neter.Dock = function(options) {
    var _this = this;
    
    this.defaults = {
        container       : document.body,
        // 插件显示位置，插件的位置基本固定在左下角
        left            : 14,
        bottom          : 14,
        // 列表中最多显示的应用的个数
        showCount       : 10,
        // 插件显示方式：h-横向显示，v-纵向显示，f-全屏显示
        showType        : 'v',
        // 当前插件的显示模式：list/full
        currentModel    : 'list',
        // 是否显示闪烁提示
        blink           : false,
        // 是否支持分组，默认为false，若支持分组则仅按v模式来显示，切不能全屏。
        group           : false,
        // 是否启用flash遮挡
        maskFlash       : false,
        /**
        * 应用程序对象数组
        格式：{
            name            : '应用程序名称',
            icon            : '应用程序图标，大小为32x32',
            label           : '应用程序的标签，主要用于数量的显示，会显示在应用程序的右上角',
            data            : '应用程序的数据，不是必须属性',
            // data2        : '另一些数据'   所有的配置信息都会在应用程序事件的回调中返回，以被用户使用。
            }
        */
        items           : [],
        // 应用程序事件，触发时带有的参数：itemEvent(dock, options, event)
        itemEvent       : null,
        // 应用程序删除事件，触发时带有的参数：itemEvent(dock, options, event)
        removeItemEvent : null
    };
    
    Neter.apply(this.defaults, options, {
        // 闪烁时的参照点
        BLINK                           : 168,
        // 内置的列表显示模式
        SHOW_TYPE_LIST                  : ['h', 'v', 'f'],
        // 应用程序纵向列表显示时行高度
        APPLICATION_HEIGHT_V            : 41,
        // 纵向时，滚动按钮的高度
        SCROLLBAR_HEIGHT_V              : 29,
        // 二级应用程序列表的指示箭头的宽度与高度
        CHILDLIST_ARROW_WIDTH           : 30,
        CHILDLIST_ARROW_HEIGHT          : 30,
        // 横向时，应用程序的宽度
        APPLICATION_WIDTH_H             : 80,
        // 横向时，滚动按钮点位宽度
        SCROLLBAR_WIDTH_H               : 48,
        // 当前的应用程序对象，主要用于一级菜单
        currentApp                      : null,
        // 全屏模式的视图宽度
        VIEW_WIDTH_FOR_FULL_LIST        : 848,
        // 全屏模式下一页显示的应用程序的个数
        APPLICATION_COUNT_FOR_FULL_LIST : 32,
        // 列表边框宽度
        LIST_BORDER_WIDTH               : 5
    });

    this.defaults.currentModel = this.defaults.showType === 'f' ? 'full' : 'list';

    this.defaults.group && (this.defaults.showType == 'f') && (this.defaults.showType = 'v');
    
    this.handler = {
        container       : this.defaults.container,      // Dock插件，没有特殊需要则直接为document.body
        dock            : null,                         // 插件本身，也是容器，主要用于代理事件
        blink           : null,                         // 开始按钮上面的闪烁对象
        dockStart       : null,                         // 插件开始按钮容器，如同windows的开始菜单
        dockStartButton : null,                         // 开始按钮
        dockList        : null,                         // 插件列表显示对象
        listview        : null,                         // 插件列表视图窗口
        childList       : null,                         // 二级应用程序列表
        childListArrow  : null,                         // 二级应用程序列表标志
        childListView   : null,                         // 二级应用程序列表的视图窗口
        fullList        : null,                         // 插件全屏显示对象
        pageToolBar     : null,                         // 全屏模式下的翻页工具栏
        apps            : [],                           // 已经添加的应用程序
        subApps         : []                            // 二级应用程序列表，这个是随着当前的一级应用程序而变化
    };
    
    this.method = {
        /**
         * 获取当前使用中的页面，即最后一个有空间的页面。
         * 若正好页面中已经有32个应用程序则创建一个新的页面并返回
         * @ignore
         * @return {HTMLElement} 返回当前正在使用中的页面
         */
        getPage : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                page     = null,
                pages    = handler.fullList.find('.neter-dock-full-list-app-list-page'),
                pageId   = handler.apps.length ? Math.ceil(handler.apps.length / (defaults.APPLICATION_COUNT_FOR_FULL_LIST)) - 1 : 0;
            
            if (page = pages.get(pageId)) {
                return $(page);
            } else {
                page = $('<div></div>').addClass('neter-dock-full-list-app-list-page')
                    .appendTo(handler.fullList.find('.neter-dock-full-list-app-list-container').get(0));

                // 创建新的页面就要创建一个按钮
                $('<a href="###"><b></b></a>').addClass('page')
                    .insertBefore(handler.pageToolBar.children().last());
            }

            return page;
        },
        /**
         * 获取对象配置信息
         * @ignore
         * @param {Number|String|HTMLElement} item 要查找的对象索引或名称或DOM对象
         * @param {Array} items 要查找的源，用于二级应用程序信息查找
         * @return {Object} 若找到返回，否则返回null
         */
        getOptions : function(item, items) {
            items = items || _this.handler.apps;

            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = null;
                switch (typeof item) {
                    case 'object':
                        ret = item && (items[i].app4list && item === items[i].app4list.get(0) || items[i].app4full && item === items[i].app4full.get(0)) ? items[i] : null;
                        break;
                    case 'string':
                        ret = item === items[i].name ? items[i] : null;
                        break;
                    case 'number':
                        ret = String(item) === String(i) ? items[i] : null;
                        break;
                }

                if (ret) {
                    return ret;
                }
            }

            return null;
        },
        /**
         * 获取应用程序在列表中的索引
         * @ignore
         * @param {Number|String} item 要检测的应用程序索引或名称
         * @param {Number} 如果应用程序在列表中，则返回相应的索引值
         */
        getIndex : function(item) {
            var items = _this.handler.apps;

            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = -1;
                switch (typeof item) {
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
            
            // 创建插件
            handler.dock = $('<div></div>').addClass('neter-dock')
                .appendTo(handler.container);
            
            // 创建开始按钮
            handler.dockStart = $('<a href="###"></a>').addClass('neter-dock-start-button-container')
                .append(handler.dockStartButton = $('<div></div>').addClass('neter-dock-start-button')
                    .append($('<b></b>').addClass('lt'))
                    .append($('<b></b>').addClass('rt'))
                    .append($('<b></b>').addClass('lb'))
                    .append($('<b></b>').addClass('rb'))
                    .append(handler.blink = $('<b></b>').addClass('neter-dock-blink'))
                )
                .appendTo(handler.dock);

            // 创建iframe遮罩
            // defaults.maskFlash
            //     && handler.dock
            //     .append($('<iframe src="' + Neter.path() + 'blank.html"></iframe>')
            //         .addClass('neter-dock-iframe')
            //         .css({
            //             width  : handler.dockStart.width(),
            //             height : handler.dockStart.height(),
            //             left   : handler.dockStart.css('left'),
            //             bottom : handler.dockStart.css('bottom')
            //         }).show()
            //     );
            
            // 创建列表
            handler.dockList = $('<div></div>')
                .addClass('neter-dock-list-fix neter-dock-list' + (defaults.showType == 'h' ? '-h' : ''))
                .append($('<div></div>').addClass('neter-dock-list-controller'))
                .append($('<a href="###"></a>').addClass(' neter-dock-list-scroll up').append('<b></b>'))
                .append(handler.listView = $('<div></div>').addClass('neter-dock-list-app-list-view')
                    .append($('<div></div>').addClass('neter-dock-list-app-list-container')))
                .append($('<a href="###"></a>').addClass(' neter-dock-list-scroll down').append('<b></b>'))
                .append($('<b></b>').addClass('t'))
                .append($('<b></b>').addClass('r'))
                .append($('<b></b>').addClass('b'))
                .append($('<b></b>').addClass('l'))
                .appendTo(handler.dock);

            defaults.maskFlash
                && handler.dock.append($('<iframe src="' + Neter.path() + 'blank.html"></iframe>').addClass('neter-dock-iframe'));

            // 创建二级菜单容器
            handler.childList = $('<div></div>')
                .addClass('neter-dock-list-fix neter-dock-list' + (defaults.showType == 'h' ? '-h' : '') +' neter-dock-child-list')
                .append($('<div></div>').addClass('neter-dock-list-controller'))
                .append($('<a href="###"></a>').addClass('neter-dock-list-scroll up').append('<b></b>'))
                .append(handler.childListView = $('<div></div>').addClass('neter-dock-list-app-list-view')
                    .append($('<div></div>').addClass('neter-dock-list-app-list-container')))
                .append($('<a href="###"></a>').addClass('neter-dock-list-scroll down').append('<b></b>'))
                .append($('<b></b>').addClass('t'))
                .append($('<b></b>').addClass('r'))
                .append($('<b></b>').addClass('b'))
                .append($('<b></b>').addClass('l')).hide()
                .appendTo(handler.dock);
            
            defaults.maskFlash
                && handler.dock.append($('<iframe src="' + Neter.path() + 'blank.html"></iframe>').addClass('neter-dock-iframe'));

            // 创建二级菜单标志
            handler.childListArrow = $('<div></div>')
                .addClass('neter-dock-child-list-arrow ' + (defaults.showType == 'h' ? 'neter-dock-child-list-arrow-h' : ''))
                .append($('<div></div>').addClass('out'))
                .append($('<div></div>').addClass('in'))
                .appendTo(handler.dock);
            
            // 创建全屏显示，其实并不是真正的全屏显示，也是一个固定大小
            handler.fullList = $('<div></div>').addClass('neter-dock-list-fix neter-dock-list neter-dock-full-list')
                .append($('<a href="###"></a>').addClass('neter-dock-full-list-controller'))
                .append($('<div></div>').addClass('neter-dock-full-list-app-list-view')
                    .append($('<div></div>').addClass('neter-dock-full-list-app-list-container')
                        .append($('<div></div>').addClass('neter-dock-full-list-app-list-page'))))
                .append($('<div></div>').addClass('neter-dock-full-list-page-toolbar')
                        .append(handler.pageToolBar = $('<span></span>')
                            .append($('<a href="###"><b></b></a>').addClass('up'))
                            .append($('<a href="###"><b></b></a>').addClass('page selected'))
                            .append($('<a href="###"><b></b></a>').addClass('down'))))
                .append($('<b></b>').addClass('t'))
                .append($('<b></b>').addClass('r'))
                .append($('<b></b>').addClass('b'))
                .append($('<b></b>').addClass('l'))
                .appendTo(handler.dock);

            defaults.maskFlash
                && handler.dock.append($('<iframe src="' + Neter.path() + 'blank.html"></iframe>')
                    .addClass('neter-dock-iframe')
                    .css({
                            width  : handler.fullList.width() + defaults.LIST_BORDER_WIDTH * 3,
                            height : handler.fullList.height() + defaults.LIST_BORDER_WIDTH * 3,
                            left   : handler.fullList.css('left').replace('px', '') - defaults.LIST_BORDER_WIDTH,
                            bottom : handler.fullList.css('bottom').replace('px', '') - defaults.LIST_BORDER_WIDTH
                        })
                );
            
            return this;
        },
        /**
         * 初始化布局
         * @ignore
         */
        initLayout : function(list, view, apps) {
            list = list || _this.handler.dockList;
            view = view || _this.handler.listView;
            apps = apps || _this.handler.apps;

            var defaults  = _this.defaults,
                handler   = _this.handler,
                container = list.find('.neter-dock-list-app-list-container'),
                appCount  = apps.length,
                height    = appCount * defaults.APPLICATION_HEIGHT_V,
                width     = appCount * defaults.APPLICATION_WIDTH_H;
            
            // 设置插件位置
            handler.dock.css({ left : defaults.left, bottom : defaults.bottom });
            
            if (defaults.showType == 'v' || defaults.showType == 'f') {
                // 设置应用程序窗口的高度
                container.height(height);
                // 应用程序视图区域高度
                view.height((appCount > defaults.showCount ? defaults.showCount : appCount) * defaults.APPLICATION_HEIGHT_V);
                // 插件列表的高度
                list.height(view.height() + defaults.SCROLLBAR_HEIGHT_V * 2);
            } else {
                // 设置应用程序窗口的宽度
                container.width(width);
                // 应用程序视图区域宽度
                view.width((appCount > defaults.showCount ? defaults.showCount : appCount) * defaults.APPLICATION_WIDTH_H);
                // 插件列表的宽度
                list.width(view.width() + defaults.SCROLLBAR_WIDTH_H * 2);
            }

            defaults.maskFlash
                && list.next()
                    .css({
                        width  : list.width() + defaults.LIST_BORDER_WIDTH * 3,
                        height : list.height() + defaults.LIST_BORDER_WIDTH * 3,
                        left   : list.css('left').replace('px', '') - defaults.LIST_BORDER_WIDTH,
                        bottom : list.css('bottom').replace('px', '') - defaults.LIST_BORDER_WIDTH
                    });

            this.updateScroll(list, view, apps);
            
            return this;
        },
        /**
         * 绑定事件
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this,
                blink    = handler.blink,
                timer    = null,
                start    = 0,
                step     = 24,
                end      = defaults.BLINK,
                fx       = function() {
                    start += step;
                    blink.css('background-position', '0 ' + (start * -1) + 'px');
                    if (start >= end) { start = 0; }
                    clearTimeout(timer);
                    timer = setTimeout(fx, 250);
                };

            // 给闪烁对象添加闪烁事件
            defaults.blink && (timer = setTimeout(fx, 250));

            handler.dock
            .on('click', '.neter-dock-list,.neter-dock-list-h', function(event) { event.stopPropagation(); })
            // 设置开始按钮的单击事件
            // 起初是绑定在.neter-dock-start-button之上，即蹭的黑色区域，发现不好单击
            // 因此绑定到按钮的容器.neter-dock-start-button-container
            .on('click', '.neter-dock-start-button-container', function(event) {
                event.stopPropagation();

                if ($(this).data('status') === 'open') {
                    method.closeList();
                    $(this).data('status', 'close');
                    return ;
                } else {
                    $(this).data('status', 'open');
                }
                // 隐藏闪烁提示
                handler.blink.hide();
    
                // 更新开始按钮的显示状态
                handler.dockStartButton.removeClass('neter-dock-start-button neter-dock-start-button-open-v neter-dock-start-button-open-h')
                    .addClass('neter-dock-start-button-expand')
                    .addClass(defaults.showType == 'h' ? 'neter-dock-start-button-open-h' : 'neter-dock-start-button-open-v');
                
                method.openList();
            });

            handler.dockList
            // 给一级应用程序添加鼠标事件
            .on('mouseenter', '.neter-dock-list-item', function(event) {
                if (!defaults.group) { return ; }
                handler.childList.hide();
                handler.childListArrow.hide();

                defaults.maskFlash
                    && handler.childList.next().hide();

                defaults.currentApp = $(this);

                var item = method.getOptions(this);

                handler.subApps = item.subApps;

                handler.subApps
                    && method.loadsubApps(handler.subApps)
                    && method.initLayout(handler.childList, handler.childListView, handler.subApps);

                var offset     = $(this).offset(),
                    top        = offset.top,
                    left       = offset.left,
                    width      = $('body').width(),
                    height     = $('body').height(),
                    childListWidth = handler.childList.outerWidth(),
                    childListHeight = handler.childList.outerHeight(),
                    bot        = height - top - childListHeight - defaults.bottom,
                    flagBottom = height - top - defaults.APPLICATION_HEIGHT_V - defaults.CHILDLIST_ARROW_HEIGHT / 2;

                if (defaults.showType === 'h') {
                    bottom     = handler.dockList.height() + defaults.CHILDLIST_ARROW_HEIGHT / 2;
                    flagBottom = handler.dockList.height();
                    left      -= defaults.left;
                    
                    handler.subApps
                        && handler.childList.css({
                            bottom : bottom,
                            // left值需要根据窗口的大小来进行调整
                            left : left + childListWidth > width ? width - childListWidth - defaults.left : left
                        }).show()
                        && handler.childListArrow.css({ bottom : flagBottom, left : left + 28 }).show();
                } else {
                    bottom = bot < 0 ? 0 : bot;
                    handler.subApps
                    && handler.childList.css({ bottom : bottom }).show()
                    && handler.childListArrow.css({ bottom : flagBottom }).show();
                }

                handler.subApps
                    && defaults.maskFlash
                    && handler.childList.next()
                    .css({
                        width  : handler.childList.width() + defaults.LIST_BORDER_WIDTH * 3,
                        height : handler.childList.height() + defaults.LIST_BORDER_WIDTH * 3,
                        left   : handler.childList.css('left').replace('px', '') - defaults.LIST_BORDER_WIDTH,
                        bottom : handler.childList.css('bottom').replace('px', '') - defaults.LIST_BORDER_WIDTH
                    }).show();

            });

            handler.dock
            // 应用程序单击事件
            .on('click', '.neter-dock-list-item,.neter-dock-full-list-item', function(event) {
                var itemEvent = defaults.itemEvent,
                    options   = method.getOptions(this, $(this).data('level') == 2 ? handler.subApps : null);

                if (typeof itemEvent === 'function'
                    && itemEvent.call(this, _this, Neter.apply({}, options, ['app4full', 'app4list']), defaults.currentModel, event) !== false) {
                    
                    method.closeList();
                } else {
                    method.closeList();
                }
            })
            // 滚动事件
            .on('click', '.neter-dock-list-scroll', function(event) {
                if ($(this).data('animate') === 'yes') { return ; }
                
                var listView = handler.listView;

                // 检测单击的滚动按钮是一级应用程序的还是二级应用程序
                if ($(this).parent('.neter-dock-child-list').length) {
                    listView = handler.childListView;
                } else {
                    // 一级应用程序列表滚动时就直接隐藏二级应用程序列表
                    handler.childList.hide();
                    handler.childListArrow.hide();
                }
                
                var viewHeight = listView.height(),
                    viewWidth  = listView.width(),
                    container  = listView.find('.neter-dock-list-app-list-container'),
                    el         = $(this).data('animate', 'yes'),
                    height     = container.height() - viewHeight,
                    width      = container.width() - viewWidth,
                    marginTop  = parseInt(String(container.css('margin-top')).replace('auto', '0')),
                    marginLeft = parseInt(String(container.css('margin-left')).replace('auto', '0')),
                    margin;

                if (defaults.showType == 'v') {
                    if ($(this).hasClass('up')) {
                        margin = marginTop + defaults.APPLICATION_HEIGHT_V;
                        
                        marginTop = margin > 0 ? marginTop : margin;
                    } else {
                        margin = marginTop - defaults.APPLICATION_HEIGHT_V;

                        marginTop = Math.abs(margin) > height ? marginTop : margin;
                    }
                } else {
                    if ($(this).hasClass('up')) {
                        margin = marginLeft + defaults.APPLICATION_WIDTH_H;
                        
                        marginLeft = margin > 0 ? marginLeft : margin;
                    } else {
                        margin = marginLeft - defaults.APPLICATION_WIDTH_H;
                        
                        marginLeft = Math.abs(margin) > width ? marginLeft : margin;
                    }
                }

                container.animate({
                    marginLeft : marginLeft,
                    marginTop  : marginTop
                }, function() {
                    var list = el.parents('.neter-dock-list,.neter-dock-list-h'),
                        view = list.find('.neter-dock-list-app-list-view'),
                        apps = list.hasClass('.neter-dock-child-list') ? method.getOptions(defaults.currentApp) : null;

                    method.updateScroll(list, view, apps);
                    el.removeData('animate')
                });

                event.preventDefault();
            });

            handler.fullList
            // 全屏模式的翻页事件
            .on('click', '.up,.down,.page', function(event) {
                // 获取当前选中的页码，从0开始
                var el         = $(this),
                    index      = $(this).siblings('.selected').index(),
                    marginLeft = index * defaults.VIEW_WIDTH_FOR_FULL_LIST,
                    container  = handler.fullList.find('.neter-dock-full-list-app-list-container'),
                    pages      = handler.pageToolBar.find('.page');
                
                if (el.data('animate') == 'yes') { return ; }

                el.data('animate', 'yes');

                if (el.hasClass('page')) {
                    index = $(this).index() - 1;
                    marginLeft = (index) * defaults.VIEW_WIDTH_FOR_FULL_LIST;
                } else if (el.hasClass('up')) {
                    // 向左翻页
                    if (index == 1) {
                        el.removeData('animate');
                        return ;
                    }
                    index -=2;
                    marginLeft = index * defaults.VIEW_WIDTH_FOR_FULL_LIST;
                } else {
                    // 向右翻页 
                    if (index == pages.length) {
                        el.removeData('animate');
                        return ;
                    }
                }
                
                container.animate({
                    marginLeft : -marginLeft
                }, function() {
                    el.removeData('animate');
                });
                
                $(pages.removeClass('selected').get(index)).addClass('selected');
            });

            $('body').bind('click', function() { method.closeList(); });

            return this;
        },
        /**
         * 更新滚动条显示
         * @ignore
         */
        updateScroll : function(list, view, apps) {
            list = list || _this.handler.dockList;
            view = view || _this.handler.listView;
            apps = apps || _this.handler.apps;

            var defaults   = _this.defaults,
                handler    = _this.handler,
                viewHeight = view.height(),
                viewWidth  = view.width(),
                container  = view.find('.neter-dock-list-app-list-container'),
                height     = container.height() - viewHeight,
                width      = container.width() - viewWidth,
                marginTop  = Math.abs(parseInt(String(container.css('margin-top')).replace('auto', '0'))),
                marginLeft = Math.abs(parseInt(String(container.css('margin-left')).replace('auto', '0'))),
                up         = list.find('.up').hide(),
                down       = list.find('.down').hide(),
                margin;

            if (defaults.showType == 'v') {
                marginTop > 0 && up.show();
                
                (marginTop < height || marginTop <= 0) && container.height() !== viewHeight && down.show();
            } else {
                marginLeft > 0 && up.show();
                (marginLeft < width || marginLeft <= 0) && container.width() !== viewWidth && down.show();
            }
            return this;
        },
        /**
         * 打开列表
         * @ignore
         * @param {String} showType 显示列表的方式，省略则为defaults.showType的值
         */
        openList : function(showType) {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            showType = showType && $.inArray(showType, defaults.SHOW_TYPE_LIST) ? showType : defaults.showType;
            
            this.initLayout();
            
            switch (showType) {
                case 'h':
                case 'v':
                    handler.fullList.hide();
                    handler.dockList.show();
                    break;
                // 全屏模式
                case 'f':
                    handler.fullList.show();
                    handler.dockList.hide();
                    break;
            }

            defaults.maskFlash && handler.dockList.next().show();
			
            handler.dockStart.data('status', 'open');
            
            return this;
        },
        /**
         * 关闭列表
         * @ignore
         */
        closeList : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;
            
            handler.blink[defaults.blink ? 'show' : 'hide']();
            handler.dockStartButton.removeClass('neter-dock-start-button-expand neter-dock-start-button-open-v neter-dock-start-button-open-h')
                                   .addClass('neter-dock-start-button');
            handler.dockList.hide();
            handler.fullList.hide();
            handler.childList.hide();
            handler.childListArrow.hide();

            defaults.maskFlash
                && handler.dockList.next().hide()
				&& handler.childList.next().hide()
                && handler.fullList.next().hide();
            handler.dockStart.data('status', 'close');

            return this;
        },
        /**
         * 插入一个控制器按钮
         * @ignore
         * @param {Number} index 要插入的位置
         * @param {Object} options 控制器按钮配置信息
                options = {
                    target     : '添加到列表（list）或全屏模式（full），或全部（all）',
                    icon       : '图标路径',
                    'style'    : '自定义样式',
                    clickEvent : '单击后执行的事件'
                }
         */
        insertControllerButton : function(index, options) {
            var defaults   = _this.defaults,
                handler    = _this.handler,
                controller = handler.dockList.find('.neter-dock-list-controller'),
                buttons    = controller.children();
            
            options        = options || {};
            
            options.target = options.target || 'all';
            options.style  = options.style || {};
            
            index = index < -1 ? buttons.length - 1 : index;
            
            if (options.target !== 'full') {
                $('<a href="###"></a>')
                    .append($('<b></b>')
                        .css('background-image', 'url(' + options.icon + ')')
                        .css(options.style))
                    .bind('click', function(event) {
                        var clickEvent = options.clickEvent;
                        
                        typeof clickEvent === 'function' && clickEvent.call(this, _this, options, 'list', event);
                    })
                    .appendTo(controller)
                    .insertBefore(buttons.get(index));
            }
            
            if (options.target !== 'list') {
                // 创建全屏模式下的控制按钮
                controller = handler.fullList.find('.neter-dock-full-list-controller');
                buttons    = controller.children();
                
                $('<a href="###"></a>')
                    .append($('<b></b>')
                        .css('background-image', 'url(' + options.icon + ')')
                        .css(options.style))
                    .bind('click', function(event) {
                        var clickEvent = options.clickEvent;
                        typeof clickEvent === 'function' && clickEvent.call(this, _this, options, 'full', event);
                    })
                    .appendTo(controller)
                    .insertBefore(buttons.get(index));
            }
            
            return this;
        },
        /**
         * 插入一个应用程序
         * @ignore
         * @param {Number} index 要插入的位置，-1则为插入到最后。
         * @param {Object} app 应用程序配置信息，参照构造函数的items参数
         */
        insert : function(index, app) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                container = handler.dockList.find('.neter-dock-list-app-list-container'),
                item     = {};

            index = ~index ? this.getIndex(index) : container.children().length;

            // 在触点列表上增加应用程序
            item.app4list = $('<div></div>').addClass('neter-dock-list-item')
                .append($('<b></b>').addClass('neter-dock-list-icon').append($('<img>').attr('src', app.icon)))
                .append($('<p></p>').addClass('neter-dock-list-name').html(app.name))
                .append($('<div></div>').addClass('neter-dock-list-label').html(app.label)[app.label ? 'show' : 'hide']())
                .appendTo(container);

            // 如果有子菜单，则添加箭头进行指示
            defaults.group
                && app.subApps
                && app.subApps.length
                && $('<b></b>').addClass('neter-dock-list-item-arrow-right')
                    .appendTo(item.app4list);

            // 调整应用程序显示顺序
            !~index && item.app4list.insertBefore(container.children().get(index));

            container = handler.fullList.find('.neter-dock-full-list-app-list-page');

            // 在全屏列表中增加应用程序
            // 全屏下增加应用程序有些特殊，需要将应用程序放到指定的页面中（一个页面仅放32个应用程序）
            var page = this.getPage();
            
            item.app4full = $('<div></div>').addClass('neter-dock-full-list-item')
                .append($('<b></b>').addClass('neter-dock-full-list-icon').append($('<img>').attr('src', app.icon)))
                .append($('<p></p>').addClass('neter-dock-full-list-name').html(app.name))
                .append($('<div></div>').addClass('neter-dock-full-list-label').html(app.label)[app.label ? 'show' : 'hide']())
                .appendTo(page);

            // 调整应用程序显示顺序
            item.app4full.insertBefore(page.children().get(index));

            // 将应用程序缓存
            handler.apps.splice(index, 0, Neter.apply({}, app, item, ['dockList', 'fullList']));
            
            return this;
        },
        /**
         * 加载二级应用应用程序
         * @ignore
         * @param {Array} apps 要加载的二级应用程序集合
         */
        loadsubApps : function(apps) {
            apps = apps || [];

            var defaults = _this.defaults,
                handler  = _this.handler,
                container = handler.childList.find('.neter-dock-list-app-list-container'),
                item     = {};

            
            container.empty();

            $.each(apps, function(index, app) {
                // 内置为最后一条
                index = container.children().length;
                // 在触点列表上增加应用程序
                app.app4list = $('<div></div>')
                    .addClass('neter-dock-list-item').data('level', 2)
                    .append($('<b></b>').addClass('neter-dock-list-icon').append($('<img>').attr('src', app.icon)))
                    .append($('<p></p>').addClass('neter-dock-list-name').html(app.name))
                    .append($('<div></div>').addClass('neter-dock-list-label').html(app.label)[app.label ? 'show' : 'hide']())
                    .appendTo(container);
            });


            return this;
        },
        /**
         * @ignore
         */
        blink : function() {
        }
    };
};

;Neter.apply(Neter.Dock.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.Dock.prototype.render
     * @return {Nter.Dock} 返回插件引用
     */
    render : function() {
        var method = this.method
            .create().initLayout().bindEvents();
            
            // 当分组时不支持全屏显示
            this.defaults.group
                || method.insertControllerButton(-1, {
                    target : 'list',
                    icon   : Neter.path() + 'resources/images/global.png',
                    'style' : {
                        backgroundPosition : '0 -288px'
                    },
                    clickEvent : function(dock, optins, type, event) {
                        dock.getStartButton().removeClass('neter-dock-start-button-open-h')
                        .addClass('neter-dock-start-button-open-v');
                    
                        dock.show('full');
                    }
                })
                .insertControllerButton(-1, {
                    target : 'full',
                    icon   : Neter.path() + 'resources/images/global.png',
                    'style' : {
                        backgroundPosition : '0 -304px'
                    },
                    clickEvent : function(dock, optins, type, event) {
                        dock.getStartButton().removeClass('neter-dock-start-button-open neter-dock-start-button-open-h')
                            .addClass(dock.getShowType() == 'h' ? 'neter-dock-start-button-open-h' : 'neter-dock-start-button-open');
                    
                        dock.show('list');
                    }
                });

        // 添加所有的应用程序
        $.each(this.defaults.items || [], function(index, item) {
            method.insert(-1, item);
        });

        method.updateScroll();

        return this;
    },
    /**
     * 获取开始按钮对象
     * @function
     * @name Neter.Dock.prototype.getStartButton
     * @return {jQueryDOM} 返回开始按钮DOM对象，经过jQuery封装。
     */
    getStartButton : function() {
        return this.handler.dockStartButton;
    },
    /**
     * 获取当前的显示模式
     * @function
     * @name Neter.Dock.prototype.getShowType
     * @return {String} 返回当前的显示模式，有三种显示模式：f（全屏模式）、h（横向模式）、v（纵向模式）
     */
    getShowType : function() {
        return this.defaults.showType;
    },
    /**
     * 插入一个应用程序
     * @function
     * @name Neter.Dock.prototype.insert
     * @param {Number} index 要插入的位置，-1则为插入到最后。
     * @param {Object} app 应用程序配置信息，参照构造函数的items参数
     * @return {Neter.Dock} 返回插件引用
     */
    insert : function(index, app) {
        this.method.insert(index, app);

        return this;
    },
    /**
     * 更新指定的应用程序信息
     * @function
     * @name Neter.Dock.prototype.update
     * @param {Number|String|HTMLElement} item 要更新的应用程序的索引或名称或DOM对象
     * @param {Object} app 应用程序配置信息
     * @param {Boolean} [updateSubApps=true] 是否直接更新二级应用程序，默认为true，
     * 为false时，如果更新一级应用程序信息而不传subApps参数则会将二级应用程序列表覆盖。
     * @return {Neter.Dock} 返回插件引用
     */
    update : function(item, app, updateSubApps) {
        var method       = this.method,
            listChildren = null,
            fullChildren = null;

        switch (typeof item) {
            // 当为字符串时要分为两种情况
            // 一种是不带有逗号的数字列表，如果是则在更新二级应用程序信息
            // 如果没有逗号则是更新一级应用程序
            case 'string':
                if (/^[\d,]+$/.test(item)) {
                    item = item.split(',');
                    var tmp = method.getIndex(item[0]);
                    if (!~tmp) { return this; }

                    if (item[1] < tmp.subApps.length && ~(item = method.getIndex(item[1]))) {
                        listChildren = item.app4list.children();
                        fullChildren = item.app4full.children();
                        break;
                    } else {
                        return this;
                    }
                }
                // 这个地方就是没有break。当是纯文字时就直接按number类型来处理
            default :
                if (!~(item = method.getOptions(item))) { return this; }
                
                listChildren = item.app4list.children();
                fullChildren = item.app4full.children();
                break;
        }

        // 更新应用程序图标
        item.icon !== app.icon
            && listChildren.first().find('img').attr('src', app.icon)
            && fullChildren.first().find('img').attr('src', app.icon);

        // 更新应用程序名称
        item.name !== app.name
            && $(listChildren.get(1)).html(app.name)
            && $(fullChildren.get(1)).html(app.name);
        
        // 更新应用程序提示信息
        item.label !== app.label
            && listChildren.last().html(app.label)[typeof app.label === 'undefined' ? 'hide' : 'show']()
            && fullChildren.last().html(app.label)[typeof app.label === 'undefined' ? 'hide' : 'show']();
        
        Neter.apply(item, app, {}, updateSubApps ? [] : ['subApps']);
        
        return this;
    },
    /**
     * 删除指定的应用程序
     * @function
     * @name Neter.Dock.prototype.remove
     * @param {Number|String|HTMLElement} item 要删除的应用程序
     * @return {Neter.Dock} 返回插件引用
     */
    remove : function(item/*[, item[, ...]]*/) {
        var method = this.method,
            apps   = this.handler.apps;

        $.each([].slice.call(arguments), function(index, value) {
            ~(index = method.getIndex(value))
                && apps[index].app4list.remove()
                && apps[index].app4full.remove()
                && apps.splice(index, 1);
        });
        return this;
    },
    /**
     * 更改插件显示方式
     * @function
     * @name Neter.Dock.prototype.setShowType
     * @param {String} type 显示方式，支持：h(横向显示),v(纵向显示),f(全屏显示)
     * @return {Boolean} 如果type指定的模式符合内置的模式要求则返回true，否则返回false
     */
    setShowType : function(type) {
        if ($.inArray(type, this.defaults.SHOW_TYPE_LIST)) {
            this.defaults.SHOW_TYPE_LIST = type;
        } else {
            return false;
        }
        return true;
    },
    /**
     * 打开插件
     * @function
     * @name Neter.Dock.prototype.show
     * @param {String} type 要显示的方式：list(系统设置的默认列表方式)，full（全屏显示）
     * @return {Neter.Dock} 返回插件引用
     */
    show : function(type) {
        var defaults = this.defaults,
            handler  = this.handler,
            iframe   = handler.fullList.next();

        type = type || '';

        handler.blink.hide()

        if (type == 'f' || type === 'full') {
            handler.dockList.hide();
            handler.fullList.show();
            defaults.currentModel = 'full';

            // 显示遮罩
            defaults.maskFlash
                && handler.dockList.next().hide()
                && handler.fullList.next().show();
        } else {
            handler.dockList.show();
            handler.fullList.hide();
            defaults.currentModel = 'list';

            // 隐藏遮罩
            defaults.maskFlash
                && handler.dockList.next().show()
                && handler.fullList.next().hide();
        }
        
        return this;
    },
    /**
     * 关闭插件
     * @function
     * @name Neter.Dock.prototype.close
     * @return {Neter.Dock} 返回插件引用
     */
    'close' : function() {
        var handler = this.handler;

        handler.dockList.hide();
        handler.fullList.hide();

        // 检测是否需要显示闪烁提示
        defaults.blink && handler.blink.show();

        return this;
    },
    /**
     * 切换页面
     * @function
     * @name Neter.Dock.prototype.togglePage
     * @param {Number} pageId 要切换到的页面ID，从0开始
     * @return {Neter.Dock} 返回插件引用
     */
    togglePage : function(pageId) {

        return this;
    },
    /**
     * 闪烁提示
     * @function
     * @name Neter.Dock.prototype.blink
     * @return {Neter.Dock} 返回插件引用
     */
    blink : function() {
        this.handler.blink.show();

        return this;
    },
    /**
     * 取消闪烁
     * @function
     * @name Neter.Dock.prototype.noBlink
     * @return {Neter.Dock} 返回插件引用
     */
    noBlink : function() {
        this.handler.blink.hide();

        return this;
    },
    /**
     * 更新应用程序单击事件
     * @function
     * @name Neter.Dock.prototype.updateApplicationEvent
     * @return {Neter.Dock} 返回插件引用
     */
    updateApplicationEvent : function(handler) {
        typeof handler === 'function' && (this.defaults.itemEvent = handler);
        
        return this;
    }
});