/**
 * 下拉菜单插件
 * @author Ly
 * @date 2012/11/17
 */
;Neter.namespace('Neter.DropDownMenu');

/**
 * @class
 * @requires Neter.Box
 * @name Neter.DropDownMenu
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    alignment   : 'left',                // 菜单相对于触发对象的默认对齐方式，支持left/right
    trigger     : null,                  // 触发菜单的元素对象
    mode        : 'hover',               // 触发菜单的模式，支持hover/click
    slideHeight : 0,                     // 显示时滑动的高度差
    showStatus  : true,                  // 是否显示选中状态，默认true
    statusType  : 'icon',                // 选中项的显示状态，默认为icon，即添加一个图标，支持：icon/bg
    hoverTime   : 500,                   // 悬念时间，单位毫秒。当触发模式为hover时此参数起效
    items       : [],                    // 菜单项对象集合
    menuEvent   : null                   // 菜单项单击后触发的事件, this指向菜单项，menuEvent(dropDownMenu, options)
}
</pre>
 */
;Neter.DropDownMenu = function(options) {
    var _this = this;
    
    this.defaults = {
        alignment   : 'left',                // 菜单相对于触发对象的默认对齐方式，支持left/right
        trigger     : null,                  // 触发菜单的元素对象
        mode        : 'hover',               // 触发菜单的模式，支持hover/click
        slideHeight : 0,                     // 显示时滑动的高度差
        showStatus  : true,                  // 是否显示选中状态，默认true
        statusType  : 'icon',                // 选中项的显示状态，默认为icon，即添加一个图标，支持：icon/bg
        hoverTime   : 500,                   // 悬停时间，单位毫秒。当触发模式为hover时此参数起效
        items       : [],                    // 菜单项对象集合
        menuEvent   : null                   // 菜单项单击后触发的事件, this指向菜单项，menuEvent(dropDownMenu, options)
    };
    
    Neter.apply(this.defaults, options, {
        id : 0,                            // 菜单项id起始值
        lastInsertIndex : -1               // 最近一次插入操作时的索引值
    });
    
    this.handler = {
        /**
         * 菜单集合，包含了菜单项与容器对应关系
         {
             box : null,
             items : [{
                 el       : '<div role="菜单项容器">' +
                                '<span role="选中符号占位符"></span>' +
                                '<span role="菜单项名称"></span>' +
                                '<span role="子菜单标志"></span>' +
                            '</div>',
                 index    : -1,           // 菜单项的位置，-1为放在最后
                 name     : '菜单项名称',   // 如果name为空则为分隔菜单
                 selected : false,        // 是否选中
                 subMenus : {             // 如果有子菜单，则放入此集合中
                    box   : null,
                    items : []
                 }
             }]
         }
         */
        menus : {
            box   : null,
            items : []
        },
        dropDownMenu : null
    };
    
    this.method = {
        /**
         * 根据菜单项对象或名称，或索引值查找对应的box
         * @ignore
         * @param {Number|String|HTMLElement} item 菜单项对象
         * @param {Object} menus 要查找的menus集合
         * @return {Box} 如果此菜单项有子菜单，则返回子菜单容器Box，否则返回null
         */
        getBox : function(item, menus) {
            var method = this,
                items;
            
            menus = menus || _this.handler.menus;
            
            items = menus.items;
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = null;
                
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? items[i].subMenus.box : null;
                        break;
                    case 'string':
                        // 如果item是由逗号分隔的字符串，则认为是按索引进行查询菜单项
                        if (!/^[\d,]+$/.test(item)) {
                            ret = items[i].name === item ? items[i].subMenus.box : null;
                            break;
                        }
                    // 当按索引查询时需要特殊处理
                    // 需要按表示级别的逗号进行拆分
                    case 'number' :
                        var tmp = String(item).split(',');
                        
                        var index = tmp.shift();
                        
                        if (tmp.length > 0 && items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                            var box = method.getBox(tmp.join(','), items[i].subMenus);
                            if (box) { return box; }
                        } else if (String(i) === String(index)) {
                            return items[i].subMenus.box;
                        }
                        // 跳过不匹配的情况，switch语句之后是string与object类型时的处理逻辑
                        continue;
                    default :
                        return null;
                }
                
                if (ret) {
                    return ret;
                } else if (items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                    var box = method.getBox(item, items[i].subMenus);
                    if (box) { return box; }
                }
            }
            
            return null;
        },
        /**
         * 根据菜单项对象获取同级项
         * @ignore
         * @param {Number|String|HTMLElement} item 菜单项对象
         * @return {Array} 与此菜单同级的所有菜单项
         */
        getSublings : function(item, menus) {
            var method = this,
                items;
            
            menus = menus || _this.handler.menus;
            
            items = menus.items;
            
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = null;
                
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? menus.items : null;
                        break;
                    case 'string':
                        // 如果item是由逗号分隔的字符串，则认为是按索引进行查询菜单项
                        if (!/^[\d,]+$/.test(item)) {
                            ret = items[i].name === item ? menus.items : null;
                            break;
                        }
                    // 当按索引查询时需要特殊处理
                    // 需要按表示级别的逗号进行拆分
                    case 'number' :
                        var tmp = String(item).split(',');
                        
                        var index = tmp.shift();
                        
                        if (tmp.length > 0 && items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                            var is = method.getSublings(tmp.join(','), items[i].subMenus);
                            if (is) { return is; }
                        } else if (String(i) === String(index)) {
                            return menus.items;
                        }
                        // 跳过不匹配的情况，switch语句之后是string与object类型时的处理逻辑
                        continue;
                    default :
                        return null;
                }
                
                if (ret) {
                    return ret;
                } else if (items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                    var is = method.getSublings(item, items[i].subMenus);
                    if (is) { return is; }
                }
            }
            
            return null;
        },
        /**
         * 根据菜单项对象获取配置信息
         * @ignore
         * @param {HTMLElement|String|Number} item 菜单项对象，菜单名称或者是索引值，如果是多个索引值则用逗号分隔
         * @return {Object} 与此菜单项的配置信息
         */
        getOptions : function(item, menus) {
            var method = this,
                items;
            
            menus = menus || _this.handler.menus;
            
            items = menus.items;
            
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = null;
                
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? items[i] : null;
                        break;
                    case 'string':
                        // 如果item是由逗号分隔的字符串，则认为是按索引进行查询菜单项
                        if (!/^[\d,]+$/.test(item)) {
                            ret = items[i].name === item ? items[i] : null;
                            break;
                        }
                    // 当按索引查询时需要特殊处理
                    // 需要按表示级别的逗号进行拆分
                    case 'number' :
                        var tmp = String(item).split(',');
                        
                        var index = tmp.shift();
                        
                        if (tmp.length > 0 && items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                            var o = method.getOptions(tmp.join(','), items[i].subMenus);
                            if (o) { return o; }
                        } else if (String(i) === String(index)) {
                            return items[i];
                        }
                        // 跳过不匹配的情况，switch语句之后是string与object类型时的处理逻辑
                        continue;
                    default :
                        return null;
                }
                
                if (ret) {
                    return ret;
                } else if (items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                    var o = method.getOptions(item, items[i].subMenus);
                    if (o) { return o; }
                }
            }
            
            return null;
        },
        /**
         * 根据菜单项对象获取所属栈
         * @ignore
         * @param {HTMLElement|String|Number} item 菜单项对象，或者是索引值，如果是多个索引值则用逗号分隔
         * @return {Object} 与此菜单项的配置信息
         */
        getStack : function(item, menus) {
            var method = this,
                items;
            
            menus = menus || _this.handler.menus;
            
            items = menus.items;
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = null;
                
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? items : null;
                        break;
                    case 'string':
                        // 如果item是由逗号分隔的字符串，则认为是按索引进行查询菜单项
                        if (!/^[\d,]+$/.test(item)) {
                            ret = items[i].name === item ? items : null;
                            break;
                        }
                    // 当按索引查询时需要特殊处理
                    // 需要按表示级别的逗号进行拆分
                    case 'number' :
                        var tmp = String(item).split(',');
                        
                        var index = tmp.shift();
                        
                        if (tmp.length > 0 && items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                            var o = method.getStack(item, items[i].subMenus);
                            if (o) { return items; }
                        } else if (String(i) === String(index)) {
                            return items;
                        }
                        // 跳过不匹配的情况，switch语句之后是string与object类型时的处理逻辑
                        continue;
                    default :
                        return null;
                }
                
                if (ret) {
                    return ret;
                } else if (items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                    var o = method.getStack(item, items[i].subMenus);
                    if (o) { return items; }
                }
            }
            
            return null;
        },
        /**
         * 获取当前选中的菜单项
         * @ignore
         */
        getSelected : function(menus) {
            var method = this,
                items;
            
            menus = menus || _this.handler.menus;
            
            items = menus.items;
            
            for (var i = 0, len = items.length; i < len; ++i) {
                if (items[i].selected) {
                    return items[i];
                } else if (items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                    var o = method.getSelected(items[i].subMenus);
                    if (o) { return o; }
                }
            }
            
            return null;
        },
        /**
         * 根据菜单项或者名称查找索引值
         * @ignore
         * @param {String|HTMLElement} item 菜单项或者名称
         */
        getIndex : function(item, menus) {
            var method = this,
                index,
                items;
            
            menus = menus || _this.handler.menus;
            
            items = menus.items;
            for (var i = 0, len = items.length; i < len; ++i) {
                var ret = -1;
                index = null;
                
                switch (typeof item) {
                    case 'object':
                        ret = items[i].el && items[i].el.get(0) === item ? i : -1;
                        break;
                    case 'string':
                        // 如果item是由逗号分隔的字符串，则认为是按索引进行查询菜单项
                        if (!/^[\d,]+$/.test(item)) {
                            ret = items[i].name === item ? i : -1;
                            break;
                        }
                    case 'number':
                        index = String(item).split(',');
                        ret = String(index[0]) === i ? i : -1;
                        if (!~ret) {
                            item = typeof index[1] === 'undefined' ? -2 : index.slice(1);
                        }
                        break;
                }
                
                if (~ret || (index &&  item === -2)) {
                    return ret;
                } else if (items[i].subMenus && items[i].subMenus.items && items[i].subMenus.items.length > 0) {
                    index = method.getIndex(item, items[i].subMenus);
                    if (~index) { return [i, index].join(','); }
                }
            }
            
            return -1;
        },
        /**
         * 创建框架
         * @ignore
         */
        create : function() {
            _this.handler.dropDownMenu = $('<div></div>').addClass('neter-drop-down-menu')
                .appendTo(document.body);
            
            return this;
        },
        /**
         * 绑定事件
         * @ignore
         */
        bindEvents : function() {
            var method   = this,
                defaults = _this.defaults;
            
            $(_this.handler.dropDownMenu)
            .on('mouseenter', 'div.neter-drop-down-menu-item', function() {
                var current = this;
                
                // 获取同级项，若同级项有子菜单，则隐藏
                $.each(method.getSublings(this) || [], function(index, item) {
                    if (item.el.get(0) === current) { return ; }
                    
                    var front = item.el.find('span.neter-drop-down-menu-item-front');
                    front.children().length || front.css({
                        background : 'url(' + Neter.path() + 'resources/images/menu_radio_checked.png) no-repeat 3px 5px'
                    });
                    
                    item.el.removeClass('neter-drop-down-menu-item-current');
                    _this.hide(item.subMenus);
                });
                
                var front = $(this).addClass('neter-drop-down-menu-item-current').find('span.neter-drop-down-menu-item-front');
                front.children().length || front.css({
                    background : 'url(' + Neter.path() + 'resources/images/menu_radio_hover.png) no-repeat 3px 5px'
                });
                
                // 显示子菜单，若有子菜单时
                var box = method.getBox(this);
                
                if (box) {
                    var offset     = $(this).offset(),
                        itemWidth  = $(this).outerWidth(),
                        boxWidth   = box.get().outerWidth(),
                        boxHeight  = box.get().outerHeight(),
                        bodyWidth  = $(document.body).outerWidth(),
                        bodyHeight = $(document.body).outerHeight();
                    
                    if (defaults.alignment == 'right') {
                        offset.left -= boxWidth + 1;
                    } else {
                        offset.left += itemWidth + 1;
                    }
                    
                    if (offset.left < 0) {
                        offset.left = offset.left + boxWidth + itemWidth + 1;
                    }
                    
                    // 修正菜单显示位置，尽可能让菜单显示在可视区域内
                    if (offset.left + boxWidth >= bodyWidth) {
                        offset.left = offset.left - itemWidth - boxWidth;
                    }
                    if (offset.top + boxHeight >= bodyHeight) {
                        offset.top = bodyHeight - boxHeight;
                    }
                    
                    box.show(offset.left, offset.top);
                }
            })
            .on('mouseleave', 'div.neter-drop-down-menu-item', function(event) {
                var o = _this.method.getOptions(this);
                
                if (o && o.subMenus.items && o.subMenus.items.length) {
                } else {
                    o.el.removeClass('neter-drop-down-menu-item-current');
                    var front = o.el.find('span.neter-drop-down-menu-item-front');
                    front.children().length || front.css({
                        background : 'url(' + Neter.path() + 'resources/images/menu_radio_checked.png) no-repeat 3px 5px'
                    });
                }
            })
            .on('click', 'div.neter-drop-down-menu-item', function(event) {
                var o = _this.method.getOptions(this);
                
                if (o && o.subMenus.items && o.subMenus.items.length) {
                    event.stopPropagation();
                    return ;
                }
                method.unselected().selected(this);
                typeof defaults.menuEvent === 'function' && defaults.menuEvent.call(this, _this, Neter.apply({}, o, ['el', 'subMenus']), event);
            });
            
            // 绑定菜单触发
            if (defaults.mode == 'hover') {
                var timer = null;
                defaults.trigger
                .on('mouseenter', function() {
                    _this.delay(defaults.hoverTime).show();
                })
                .on('mouseleave', function() {
                    _this.stop(true);
                });
            } else {
                defaults.trigger.on(defaults.mode, function(event) {
                    _this.show();
                    
                    return false;
                });
            }
            
            return this;
        },
        /**
         * 插件一个菜单项
         * @ignore
         * @param {Number} index 菜单项要插入的位置，从0开始计算，-1代表在最后插入,菜单项分隔符也占用索引值
         * @param {Object} options 菜单项信息
                options = {
                    name     : '菜单项名称',   // 如果name为空则为分隔菜单
                    front    : HTMLElement,  // 前置元素，如果设置了图标，则不能再进行选中标识
                    rear     : HTMLElement,  // 后置元素对象，如果添加了后置元素则不能再添加子菜单
                    selected : false,        // 是否选中
                    subMenus : []            // 如果有子菜单则会递归调用加载
                }
         * @param {Number|String} parentMenuIndex  如果要作为一个子项，则要传入父菜单的索引，多级菜单时使用逗号分隔索引值
         */
        insert : function(index, options, parentMenuIndex) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this,
                subMenus = null,
                menus    = handler.menus,
                box      = menus.box,
                item     = null,
                items    = menus.items;
            
            // 遍历出父菜单项
            if (typeof parentMenuIndex !== 'undefined') {
                parentMenuIndex = String(parentMenuIndex).split(',');
                
                for (var i = 0, len = parentMenuIndex.length; i < len; ++i) {
                    // 找到指定的父菜单项集合
                    box   = menus.box;
                    items = menus.items;
                    item  = items[parentMenuIndex[i]];
                    
                    if (!item) {
                        Neter.log('Neter.DropDownMenu.insert()方法无法执行，参数列表:', 'group');
                        Neter.log('index=%d', index, 'log');
                        Neter.log('options=%o', options, 'log');
                        Neter.log('parentMenuIndex=%s', parentMenuIndex, 'log');
                        Neter.log('', 'groupEnd');
                        return this;
                    }
                    
                    // 将父菜单项集合存于menus，用于遍历下一父菜单
                    menus = item.subMenus;
                }
            }
            
            // 创建菜单项，如果有父菜单，则将菜单项加入父菜单队列
            if (!menus.box) {
                menus.box = new Neter.Box({
                    container    : handler.dropDownMenu,
                    width        : 'auto',
                    height       : 'auto',
                    slideHeight  : defaults.slideHeight,
                    paddingWidth : 2,
                    closeButton  : false
                }).render(false);
            }
            
            // 拷贝参数
            item = Neter.apply({}, options, {
                el : options.name
                    // 普通菜单项
                    ? $('<div></div>').addClass('neter-drop-down-menu-item')
                        .append($('<span></span>').addClass('neter-drop-down-menu-item-front')
                            .append(options.front || null))
                        .append($('<span></span>').addClass('neter-drop-down-menu-item-name')
                            .append(options.name))
                        .append($('<span></span>').addClass('neter-drop-down-menu-item-rear')
                            .append(options.rear || null))
                    // 菜单项分隔线
                    :  $('<div></div>').addClass('neter-drop-down-menu-separator'),
                subMenus : {
                    box   : null,
                    items : []
                }
            });
            
            options.front && item.el.find('span.neter-drop-down-menu-item-front').css({ background : 'none' }).show();
            options.rear && item.el.find('span.neter-drop-down-menu-item-rear').css({ background : '' }).show();
            
            // 判断是否选中了当前菜单
            defaults.showStatus && options.selected && item.el.children().first().show();
            
            // 将菜单项添加到菜单中
            menus.box.content(item.el.get(0), true);
            
            index = (index < 0 || index >= menus.box.content().length)
                        ? menus.box.content().length
                        : index;
            
            // 调整菜单位置
            menus.box.content().length > 1 && item.el.insertBefore(menus.box.content().get(index))
            
            menus.items.splice(index, 0, item);
            
            // 保存插入时的index，用于insert操作时的递归
            defaults.lastInsertIndex = --index;
            
            // 如果有后置对象，则屏蔽掉subMenus参数，即不增加子菜单
            if (options.rear) { return this; }
            
            // 递归增加子菜单
            if (typeof parentMenuIndex !== 'undefined') {
                parentMenuIndex += ',' + index;
            } else {
                parentMenuIndex = index;
            }
            (subMenus = options.subMenus)
                && subMenus instanceof Array
                && subMenus.length > 0
                && item.el.children().last().show()
                && $.each(subMenus, function(i, o) { method.insert(-1, o, parentMenuIndex); });
            
            return this;
        },
        /**
         * 选中指定的菜单项
         * @ignore
         * @param {Number|String|HTMLElement} item 被选中的菜单项的id值或者是菜单名称或者菜单项对象
         * @param {Boolean} flag 是否要触发菜单事件，默认为false
         */
        selected : function(item, flag) {
            var defaults   = _this.defaults,
                items      = _this.handler.menus.items,
                fun        = function(items, item) {
                    var res;
                    
                    if (!item) { return false; }
                    for (var i = 0, len = items.length; i < len; ++i) {
                        if (items[i].subMenus.items.length > 0) {
                            if (fun(items[i].subMenus.items, item)) {
                                (items[i].selected = true)
                                    && defaults.showStatus
                                    && (defaults.statusType == 'icon' ? items[i].el.children().first().show() : items[i].el.addClass('neter-drop-down-menu-item-selected'));
                                return true;
                            }
                        } else if (items[i].el && item.el && items[i].el.get(0) == item.el.get(0)) {
                            (items[i].selected = true)
                                && defaults.showStatus
                                && (defaults.statusType == 'icon' ? items[i].el.children().first().show() : items[i].el.addClass('neter-drop-down-menu-item-selected'))
                            
                            flag && items[i].el.trigger('click');
                            return true;
                        }
                    }
                    return false;
                };
            
            fun(items, this.getOptions(item));
            
            return this;
        },
        /**
         * 取消选中的菜单项
         * @ignore
         */
        unselected : function() {
            var defaults = _this.defaults,
                fun = function(items) {
                var res;
                for (var i = 0, len = items.length; i < len; ++i) {
                    var front = items[i].el.children().first();
                    
                    // 隐藏非自定义前置项。
                    front.children().length || front.hide();

                    items[i].el.removeClass('neter-drop-down-menu-item-selected');
                    
                    // 取消选中状态
                    items[i].selected = false;
                    
                    // 如果有子菜单项，递归所有的子菜单项
                    items[i].subMenus.items.length > 0 && fun(items[i].subMenus.items);
                }
            };
            
            fun(_this.handler.menus.items);
            
            return this;
        },
        /**
         * 删除插件
         * @ignore
         */
        remove : function(menus) {
            var method = this;
            menus = menus || _this.handler.menus;

            // 递归销毁所有的box
            menus.box && menus.box.remove();

            for (var i = 0, len = menus.items.length; i < len; ++i) {
                menus.items[i].subMenus && method.remove(menus.items[i].subMenus);
            }

            return this;
        }
    };
};

;Neter.apply(Neter.DropDownMenu.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.DropDownMenu.prototype.render
     */
    render : function() {
        var method = this.method.create();
        
        (!this.defaults.items || this.defaults.items.length < 1) &&  Neter.log('Neter.DropDownMenu渲染完成，但未指定菜单项...');
        
        $.each(this.defaults.items || [], function(index, item) {
            method.insert(-1, item);
        });
        
        this.method.bindEvents();
        
        return this;
    },
    /**
     * 获取插件DOM对象
     * @function
     * @name Neter.DropDownMenu.prototype.get
     */
    get : function() {
        return this.handler.dropDownMenu;
    },
    /**
     * 显示插件，当参数都省略时取this.defaults.trigger对象的左下角
     * @function
     * @name Neter.DropDownMenu.prototype.show
     * @param {Number} [left] 插件显示时的左偏移量
     * @param {Number} [top] 插件显示时的上偏移量
     */
    show : function(left, top) {
        var defaults = this.defaults,
            trigger  = defaults.trigger,
            box      = this.handler.menus.box,
            offset   = { left : left, top : top };
        
        // 当没有子菜单，即没有box时则直接退出
        if (!box) { return this; }
        
        if (arguments.length == 0 && defaults.trigger) {
            offset      = trigger.offset();
            
            offset.left = defaults.alignment == 'right'
                            ? offset.left - (box.get().outerWidth() - trigger.outerWidth())
                            : offset.left;
            offset.top  = offset.top + trigger.outerHeight();
        }
        
        box.show(offset.left, offset.top);
        
        return this;
    },
    /**
     * 隐藏插件
     * @function
     * @name Neter.DropDownMenu.prototype.hide
     */
    hide : function(menus) {
        var method = this;
        
        menus = menus || this.handler.menus;
        
        var items = menus.items;
        
        $.each(items, function(index, item) {
            var subMenus = item.subMenus;
            
            if (item.selected) {
                var front = item.el.find('span.neter-drop-down-menu-item-front');
                front.children().length || front.css({
                    background : 'url(' + Neter.path() + 'resources/images/menu_radio_checked.png) no-repeat 3px 5px'
                });
            }
            
            subMenus.box
                && subMenus.box.hide().content().removeClass('neter-drop-down-menu-item-current')
                && subMenus.items.length
                && method.hide(subMenus);
        });
        
        menus.box && menus.box.hide().content().removeClass('neter-drop-down-menu-item-current');
        
        return this;
    },
    /**
     * 插入一个菜单项
     * @function
     * @name Neter.DropDownMenu.prototype.insert
     * @param {Number} index 菜单项要插入的位置，从0开始计算，-1代表在最后插入,菜单项分隔符也占用索引值
     * @param {Object} options 菜单项信息
     <pre>
            options = {
                name     : '菜单项名称',   // 如果name为空则为分隔菜单
                front    : HTMLElement,  // 前置元素，如果设置了图标，则不能再进行选中标识
                rear     : HTMLElement,  // 后置元素对象，如果添加了后置元素则不能再添加子菜单
                selected : false,        // 是否选中
                subMenus : []            // 如果有子菜单则会递归调用加载
            }
    </pre>
     * @param {Number|String} parentMenuIndex  如果要作为一个子项，则要传入父菜单的索引，多级菜单时使用逗号分隔索引值
     */
    insert : function(index, options, parentMenuIndex) {
        index = this.getIndex(index);
        this.method.insert(index < -1 ? -1 : index, options || {}, parentMenuIndex);
        
        return this;
    },
    /**
     * 更新菜单项信息
     * @function
     * @name Neter.DropDownMenu.prototype.update
     * @param {Number|String} index 要更新的菜单索引，子菜单项使用逗号分隔
     * @param {Object} options 菜单项信息
     */
    update : function(index, options) {
        var current = this.method.getOptions(this.getIndex(index));
        
        if (current) {
            var el = current.el;
            
            options.front && el.children().first().empty().append(options.front).show();
            
            // 如果当前的菜单项有子菜单项，则不可以添加后置对象
            options.rear && current.subMenus.items.length == 0 && el.children().last().empty().append(options.rear).show();
            
            options.name !== current.name && el.children('.neter-drop-down-menu-item-name').html(options.name);
            
            Neter.apply(current, options, {}, ['el', 'subMenus']);
        }
        
        return this;
    },
    /**
     * 删除指定的菜单项
     * @function
     * @name Neter.DropDownMenu.prototype.remove
     * @param {Number|String|HTMLElement} index 要删除的菜单项对象，菜单名称或索引，
     * 如果仅有一个参数，且为true则为移除插件本身
     * 如果是子菜单（按索引删除），使用逗号分隔索引值，支持多个参数
     */
    remove : function(index /* [, index, ... ] */) {
        var _this  = this,
            item   = null,
            method = this.method,
            fun = function(index) {
                $.each([].slice.call(arguments, 0), function(i, index) {
                    item = method.getOptions(index);
                    
                    if (item) {
                        var tmp      = [],
                            subMenus = item.subMenus;
                        
                        subMenus.box && subMenus.box.remove();
                        
                        subMenus.items.length > 0
                            && $.each(subMenus.items, function(i) { tmp.push(index + ',' + i); })
                            && fun.apply(_this, tmp);
                        
                        item.el && (tmp = item.el.children().last(), tmp.children().length || tmp.hide());
                        
                        for (var i = subMenus.items.length - 1; i > -1; --i) {
                            item = subMenus.items[i];
                            item.el.remove();
                            
                            item.el    = null;
                            item.front = null;
                            item.rear  = null;
                            
                            subMenus.items.splice(i, 1);
                        }
                        
                        subMenus.box   = null;
                        subMenus.items = [];
                    }
                });
            };

        // 如果仅一个true参数，则删除插件，并且返回null
        if (index === true) {
            this.method.remove();
            this.handler.dropDownMenu.remove();

            return null;
        }

        fun.apply(_this, arguments);
        
        if (!(item = method.getOptions(index))) {
            return this;
        }
        
        item.el.remove();
        item.el = null;
        
        item = method.getStack(index);
        index = method.getIndex(index);
        
        item.splice(String(index).split(',').pop(), 1);
        
        return this;
    },
    /**
     * 设置菜单项是否显示状态
     * @function
     * @name Neter.DropDownMenu.prototype.showStatus
     * @param {Boolean} show true为显示状态，false为不显示。
     * @return {Neter.DropDownMenu} 返回插件的引用
     */
    showStatus : function(show) {
        this.defaults.showStatus = show;

        return this;
    },
    /**
     * 设置菜单项的当前选中项样式
     * @function
     * @name Neter.DropDownMenu.prototype.statusType
     * @param {String} type 选中项样式，支持：icon/bg
     * @return {Neter.DropDownMenu} 返回插件的引用
     */
    statusType : function(type) {
        this.defaults.statusType = type === 'bg' ? 'bg' : 'icon';

        return this;
    },
    /**
     * 选中指定的菜单项
     * @function
     * @name Neter.DropDownMenu.prototype.selected
     * @param {Number|String|HTMLElement} index 要选中的菜单项索引，子菜单项使用逗号分隔
     * @param {Boolean} flag 是否触发选中菜单项的事件，默认为true
     * @return {Object|Neter.DropDownMenu} 返回插件的引用，若省略参数则返回当前选中项。
     */
    selected : function(index, flag) {
        if (!arguments.length) {
            return this.method.getSelected();
        }
        this.method.unselected().selected(index, flag !== false);
        
        return this;
    },
    /**
     * 取消选中项
     * @function
     * @name Neter.DropDownMenu.prototype.unselected
     * @return {Neter.DropDownMenu} 返回插件的引用
     */
    unselected : function() {
        this.method.unselected();
        
        return this;
    },
    /**
     * 更新菜单项事件
     * @function
     * @name Neter.DropDownMenu.prototype.menuEvent
     * @param {Function} handler 新的菜单项事件
     * @return {Neter.DropDownMenu} 返回插件的引用
     */
    menuEvent : function(handler) {
        if (typeof handler === 'function') {
            this.defaults.menuEvent = handler;
        }
        
        return this;
    },
    /**
     * 获取导航项索引值
     * @function
     * @name Neter.DropDownMenu.prototype.getIndex
     * @param {Number|String|HTMLElement} item 要查找的导航项索引值，或名称，或DOM对象
     * @return {Number} item对应的索引值，-1为未找到
     */
    getIndex : function(item) {
        return this.method.getIndex(item);
    }
});