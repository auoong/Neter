/**
 * 组合框插件
 * @author Ly
 * @date 2012/12/12
 */
;Neter.namespace('Neter.ComBox');

/**
 * @class
 * @extends Neter.Button
 * @name Neter.ComBox
 * @param {Object} options 自定义配置信息，默认配置信息如下：
<pre>
  options = {
    container     : document.body,    // 插件容器
    slideHeight   : 0,                // 显示时滑动的高度差
    width         : 'auto',           // 设置插件的宽度，默认为自动设置
    maxSize       : 'auto',           // 设置最大显示行数，默认为所有
    items         : null,             // 按钮的下拉菜单配置信息，如果有下拉菜单会在按钮右侧出现一个下拉箭头
    disabled      : false,            // 是否禁止选择列表项，默认为false
    changeEvent   : null,             // 切换选项事件
    defaultItem   : '',               // 默认的选中项
    allowInput    : false,            // 是否允许输入，默认为false
    inputAddEvent : null              // 输入框添加选项事件，返回false不添加
 }
 </pre>
  */
;Neter.ComBox = function(options) {
    var _this = this;

    this.defaults = {
        container     : document.body,    // 插件容器
        slideHeight   : 0,                // 显示时滑动的高度差
        width         : 'auto',           // 设置插件的宽度，默认为自动设置
        maxSize       : 'auto',           // 设置最大显示行数，默认为所有
        items         : null,             // 按钮的下拉菜单配置信息，如果有下拉菜单会在按钮右侧出现一个下拉箭头
        disabled      : false,            // 是否禁止选择列表项，默认为false
        changeEvent   : null,             // 切换选项事件
        defaultItem   : '',               // 默认的选中项
        allowInput    : false,            // 是否允许输入，默认为false
        inputAddEvent : null              // 输入框添加选项事件，返回false不添加
    };

    Neter.apply(this.defaults, options);
    
    // 初始化默认参数
    Neter.apply(this.defaults, {
        modify               : true,
        clickEvent           : options.changeEvent,
        menus                : options.items,
        // 按钮的右内补丁宽度
        BUTTON_PADDING_RIGHT : 20,
        // 输入框居左的距离
        INPUT_PADDING_LEFT   : 12,
        // 列表项高度
        ITEM_HEIGHT          : 27
    });

    // 创建默认列表项
    this.defaults.name = typeof options.defaultItem === 'undefined' ? getSelected() : options.defaultItem;

    /** @ignore */
    function getSelected() {
        var item     = (_this.handler && _this.handler.items) || _this.defaults.items || [],
            selected;

        $.each(item, function(index, item) {
            if (item.selected) {
                selected = item.name;
            }
        });

        return typeof selected === 'undefined' && item.length ? item[0].name : selected;
    }


    Neter.Button.call(this, this.defaults);

    Neter.apply(this.handler, {
        items    : this.defaults.items || [],
        input    : null,
        selected : null
    });

    var method = this.method,
        _super = Neter.apply({}, method);

    /**
     * @ignore
     */
    Neter.apply(method, {
        /**
         * 获取当前选中的列表项
         * @ignore
         * @return {String} 返回当前选中的列表项的名称
         */
        getSelected : getSelected,
        /**
         * 重写下拉菜单默认事件，加入修改输入框内容。
         * @ignore
         */
        menuEvent : function(menu, options, event) {
            var defaults = _this.defaults,
                handler  = _this.handler;

            _super.menuEvent.apply(this, arguments);

            // 增加微数据mask，用于比较是否修改了当前项
            handler.input.data('mask', options.name).val(options.name);
            
            // 保存当前选中的项
            handler.selected = options;
        },
        /**
         * 在原来的基础之上创建可输入框
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            _super.create.call(this);

            handler.button.addClass('neter-combox');

            // 创建输入框项
            handler.input = $('<input>', { type : 'text', maxlength : 100 }).addClass('neter-combox-input')
                .val(defaults.name)
                .appendTo(handler.button);

            // 检测是否显示输入框
            defaults.allowInput && handler.input.show();

            // 设置下拉列表项的选中状态
            handler.menu.showStatus(true).statusType('bg').selected(defaults.name);

            return this;
        },
        /**
         * @ignore
         */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                width    = defaults.width - defaults.BUTTON_PADDING_RIGHT;

            _super.initLayout.call(this);

            if (defaults.width !== 'auto') {
                handler.button.width(width);
                handler.input.width(width - defaults.INPUT_PADDING_LEFT);
                // 设置label的宽度，并且要多余的文字
                handler.label.width(width - defaults.INPUT_PADDING_LEFT).addClass('neter-combox-label-fix')

                // 这个操作比较危险，因为是直接操作的menu.handler下的box
                handler.menu.handler.menus.box.get().width() < width
                    && handler.menu.handler.menus.box.width(defaults.width);
            } else {
                handler.input.width(handler.label.width() + 2/*border-width*/);
            }

            // 根据maxSize来设置列表框高度
            if (defaults.maxSize !== 'auto' && defaults.maxSize != 0) {
                var height = defaults.maxSize * defaults.ITEM_HEIGHT,
                    view   = handler.menu.handler.menus.box.height(height, false).getView(),
                    item   = handler.menu.selected();

                view.css({ overflow : 'auto' });
            }

            return this;
        },
        /**
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            _super.bindEvents.call(this);

            handler.input.on('blur', function() {
                var item = $.trim($(this).val());
                if (item === $(this).data('mask') || (typeof defaults.inputAddEvent === 'function' && defaults.inputAddEvent.call(this, _this, event) === false)) {
                    return ;
                }

                handler.menu.insert(-1, {
                    name : item
                }).selected(item);

                handler.items.push(handler.selected = {
                    name : item
                });
            });

            return this;
        }
    });
};

;Neter.apply(Neter.ComBox.prototype, Neter.Button.prototype, {
    /**
     * 插入一个列表项
     * @function
     * @name Neter.ComBox.prototype.insert
     * @param {Number} [index=-1] 选项的位置，默认为-1，即插入到最后
     * @param {Object} options 增加的列表项信息，必须要有name属性
     * @param {Boolean} [selected=false] 是否选中新添加的此项
     * @return {Neter.ComBox} 返回插件的引用
     */
    insert : function(index, options, selected) {
        var handler = this.handler;

        if (typeof options.name === 'undefined') {
            Neter.log('Neter.ComBox调用被终止，因为参数options没有name属性值', 'warning');

            return this;
        }

        index = typeof index === 'undefined' ? handler.items.length - 1 : index;

        handler.menu.insert(index, options);

        selected
            && handler.menu.selected(options.name)
            && (handler.selected = options);

        handler.items.splice(index, 0, options);

        return this;
    },
    /**
     * 删除列表项，或者是删除此插件
     * @function
     * @name Neter.ComBox.prototype.remove
     * @param {String|Boolean} item 如果传递一个字符串，则删除此字符串匹配的列表项。
     * 如果传递的是一个Boolean值true，则删除此插件
     * 如果省略参数则清空所有的列表项
     */
    remove : function(item/*[, item[, ...]]*/) {
        var defaults = this.defaults,
            handler  = this.handler,
            menu     = handler.menu,
            arg      = [].slice.call(arguments),
            // 是否需要重置选中项，如果被删除的是当前选中项
            flag     = false;

        // 删除插件
        if (item === true) {
            menu.remove();
            handler.input.remove();
            handler.button.remove();

            return null;
        }

        arg.length === 0
            // 删除所有的列表项
            ? $.each(handler.items, function(index, item) {
                menu.remove(item.name);
                }) && (handler.items = [], flag = true)
            // 删除指定的列表项
            : $.each(arg, function(index, item) {
                menu.remove(item);
                })
                && (handler.items = $.map(handler.items, function(item) {
                    if (~$.inArray(item.name, arg)) {
                        if (item.name === handler.selected.name) { flag = true; }
                        return null;
                    }
                    return item;
                }));
        
        // 重置选中项为第一项
        flag
            && handler.items.length
            && this.selected(handler.items[0].name);

        return this;
    },
    /**
     * 选中指定的项
     * @function
     * @name Neter.ComBox.prototype.selected
     * @param {String} [item] 要选择的项，省略则返回当前选中的项
     * @return {Neter.ComBox} 返回插件的引用
     */
    selected : function(item) {
        var handler = this.handler;

        if (!arguments.lenght) {
            return handler.selected;
        }

        $.each(handler.items, function(index, value) {
            if (value.name === item) {
                handler.selected = value;
                handler.menu.selected(value.name);
            }
        });

        return this;
    },
    /**
     * 获取列表项的索引值
     * @function
     * @name Neter.ComBox.prototype.getIndex
     * @param {String} item 列表项名称
     * @return {Number} 若在列表中查找到此列表项则返回列表项索引值，否则返回-1
     */
    getIndex : function(item) {
        var items = this.handler.items;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (items[i].name === item) {
                return i;
            }
        }

        return -1;
    }
});