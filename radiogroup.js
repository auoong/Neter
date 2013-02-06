/**
 * 单选按钮组插件
 * @author Ly
 * @date 2012/12/19
 */
;Neter.namespace('Neter.RadioGroup');

/**
 * @class
 * @name Neter.RadioGroup
 * @param {Object} options 自定义配置信息
<pre>
options = {
    // 承载按钮的默认容器，在insert中可以单独指定特例
    container     : document.body,
    // 按钮组名称
    groupName     : 'neter_radio_' + Neter.count(),
    // 选择事件，返回false则不选中
    selectedEvent : null,
    // 显示方式，默认为h（横向）/v（纵向）
    showType      : 'h',
    // 默认的按钮集合
    radios        : []
}
</pre>
 */
;Neter.RadioGroup = function(options) {
    var _this = this;

    this.defaults = {
        // 承载按钮的默认容器，在insert中可以单独指定特例
        container     : document.body,
        // 按钮组名称
        groupName     : 'neter_radio_' + Neter.count(),
        // 选择事件，返回false则不选中
        selectedEvent : null,
        // 显示方式，默认为h（横向）/v（纵向）
        showType      : 'h',
        // 默认的按钮集合
        radios        : []
    };

    Neter.apply(this.defaults, options, {
        LAYOUT_H_CLASS               : 'neter-radio-group-radio',
        LAYOUT_V_CLASS               : 'neter-radio-group-radio-v',
        ICON_NORMAL_CLASS            : 'neter-radio-group-radio-icon',
        ICON_SELECTED_CLASS          : 'neter-radio-group-radio-icon-selected',
        ICON_DISABLED_CLASS          : 'neter-radio-group-radio-icon-disabled',
        ICON_SELECTED_DISABLED_CLASS : 'neter-radio-group-radio-icon-selected-disabled'
    });

    this.handler = {
        container : this.defaults.container,
        radios    : []
    };

    /** @ignore */
    this.method = {
        /**
         * 根据名称获取配置信息
         * @param {String} item 按钮名称
         * @return {Object} 按钮配置信息
         */
        getOptions : function(item) {
            var radios = _this.handler.radios;

            for (var i = 0, len = radios.length; i < len; ++i) {
                if (radios[i].name === item || radios[i].radio.get(0) === item) {
                    return radios[i];
                }
            }

            return null;
        },
        /** @ignore */
        create : function(index, options) {
            var defaults  = _this.defaults,
                handler   = _this.handler,
                container = options.container || defaults.container,
                // 创建单选钮
                radio     = $('<span></span>').addClass('neter-radio-group-radio').appendTo(container),
                // 创建按钮图标
                icon      = $('<span><b></b></span>').addClass(defaults.ICON_NORMAL_CLASS).appendTo(radio),
                // 创建按钮标签
                label     = $('<span></span>').addClass('neter-radio-group-radio-label').append(options.tag).appendTo(radio);

            var childrens = container.find('span.neter-radio-group-radio');

            index = index < 0 ? (childrens.length > 0 ? childrens.length : 0) : index;
            
            // 插入到指定位置
            index !== (childrens.length - 1) && radio.insertBefore(childrens.get(index));

            // 缓存
            handler.radios.splice(index, 0, Neter.apply(options, { radio : radio, icon : icon, label : label }));

            this.bindEvents(radio, options).updateStatus(icon, options);

            return this;
        },
        /** @ignore */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            $.each(handler.radios, function(index, item) {
                item.radio[defaults.showType === 'v' ? 'addClass' : 'removeClass']('neter-radio-group-radio-v');
            });

            return this;
        },
        /** @ignore */
        bindEvents : function(item, options) {
            var defaults = _this.defaults,
                method   = this;

            if (!item) { return this; }

            item.on('click', { name : options.name }, function(event) {
                var options = method.getOptions(event.data.name);

                if (typeof defaults.selectedEvent === 'function' && defaults.selectedEvent.call(this, _this, Neter.apply({}, options, ['radio', 'icon', 'label', 'selected']), event) === false) {
                    return ;
                }

                if (options.disabled) { return ; }

                _this.method.selected($(this).find('.' + defaults.ICON_NORMAL_CLASS));
            });

            return this;
        },
        /**
         * 更新按钮状态
         * @ignore
         */
        updateStatus : function(item, options) {
            var defaults = _this.defaults,
                handler  = _this.handler;

            options = options || {};

            options.selected && options.icon.addClass(defaults.ICON_SELECTED_CLASS);
            options.disabled
                && options.icon.addClass(options.selected ? defaults.ICON_SELECTED_DISABLED_CLASS : defaults.ICON_DISABLED_CLASS)
                && options.icon.removeClass(defaults.ICON_SELECTED_CLASS);

            return this;
        },
        /**
         * 选中按钮
         * @param {HTMLDOM} item 按钮图标对象
         * @ignore
         */
        selected : function(item) {
             var defaults = _this.defaults,
                cls      = defaults.ICON_SELECTED_CLASS;

            $.each(_this.handler.radios, function(index, value) {
                if (value.icon.get(0) === $(item).get(0)) {
                    value.icon.addClass(_this.defaults.ICON_SELECTED_CLASS);
                    value.selected = true;
                } else {
                    value.icon.removeClass(cls);
                    value.selected = false;
                }
            });

            return this;
        },
        /**
         * 取消选中
         * @ignore
         */
        unselected : function() {
            var defaults = _this.defaults,
                cls      = defaults.ICON_SELECTED_CLASS;

            $.each(_this.handler.radios, function(index, item) {
                item.icon.removeClass(cls);
                item.selected = false;
            });

            return this;
        }
    };
};

;Neter.apply(Neter.RadioGroup.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.RadioGroup.prototype.render
     * @return {Neter.RadioGroup} 返回插件引用
     */
    render : function() {
        var method = this.method;

        $.each(this.defaults.radios || [], function(index, item) {
            method.create(-1, item);
        });

        method.initLayout();

        return this;
    },
    /**
     * 插入一个新的单选钮
     * @function
     * @name Neter.RadioGroup.prototype.insert
     * @param {Number} index 要插入的位置，-1位插入到最后
     * @param {Object} options 按钮配置信息
     <pre>
      options = {
        label    : '按钮的标签名',
        name     : '按钮名称',
        value    : '按钮值',
        selected : false,
        disabled : false
     }
     </pre>
     * @return {Neter.RadioGroup} 返回插件引用
     */
    insert : function(index, options) {
        this.method.create(index, options).initLayout();

        return this;
    },
    /**
     * 更新单选钮
     * @function
     * @name Neter.RadioGroup.prototype.insert
     * @param {String} name 要更新的按钮名称
     * @param {Object} options 按钮配置信息
     <pre>
      options = {
        label    : '按钮的标签名',
        name     : '按钮名称',
        value    : '按钮值',
        selected : false,
        disabled : false
     }
     </pre>
     * @return {Neter.RadioGroup} 返回插件引用
     */
    update : function(name, options) {
        var handler = _this.handler,
            item    = this.method.getOptions(name);

        if (!item) { return this; }

        item.tag !== options.tag && handler.label.empty().append(options.tag);
        options.selected && this.selected(name);
        options.disabled && this.disabled(name, true);

        Neter.apply(item, options, {}, ['radio', 'icon', 'label', 'name']);

        return this;
    },
    /**
     * 删除按钮，或插件
     * @function
     * @name Neter.RadioGroup.prototype.remove
     * @param {Number|String} [item] 要删除的按钮索引或名称，可以是多个参数若省略参数则删除插件
     * @return {Null|Neter.RadioGroup} 删除按钮返回插件引用，删除插件时返回null
     */
    remove : function(item/*[, item[, ...]]*/) {
        if (arguments.length) {
            var radios = this.handler.radios,
                items  = [].slice.call(arguments);

            for (var i = radios.length - 1; i < len; ++i) {
                if (~$.inArray(radios[i].name, items)) {
                    radios[i].radio.remove();
                    radios[i].icon  = null;
                    radios[i].label = null;
                    radios[i].radio = null;
                }
            }
        } else {
            $.each(this.handler.radios, function(index, value) {
                value.radio.remove();
                value.icon  = null;
                value.label = null;
                value.radio = null;
            });

            this.handler.radios = [];

            return null;
        }

        return this;
    },
    /**
     * 设置或获取按钮显示方式
     * @function
     * @name Neter.RadioGroup.prototype.showType
     * @param {String} type 按钮显示方式，h/v;省略则返回当前的显示方式
     * @return {String|Neter.RadioGroup} type省略时返回当前的显示方式，否则返回插件引用
     */
    showType : function(type) {
        if (arguments.length) {
            this.defaults.showType = type === 'h' ? 'h' : 'v';

            this.method.initLayout();
        } else {
            return this.defaults.showType;
        }
        return this;
    },
    /**
     * 更新插件的选择事件
     * @function
     * @name Neter.RadioGroup.prototype.updateSelectedEvent
     * @param {Function} handler 要更新的事件
     * @return {Neter.RadioGroup} 返回插件引用
     */
    updateSelectedEvent : function(handler) {
        if (typeof handler === 'function') {
            this.defaults.selectedEvent = handler;
        }
        return this;
    },
    /**
     * 选中或获取一个按钮
     * @function
     * @name Neter.RadioGroup.prototype.selected
     * @param {String} [name] 要选择的按钮名称，省略则获取当前选中的菜单
     * @return {Neter.RadioGroup} 返回插件引用
     */
    selected : function(name) {
        var method  = this.method,
            options = method.getOptions(name),
            current = null;

        if (!arguments.length) {
            $.each(this.handler.radios, function(index, value) {
                current = value.selected ? Neter.apply({}, value, ['radio', 'icon', 'label']) : current;
            });

            return current;
        }

        options && method.selected(options.icon);

        return this;
    },
    /**
     * 禁用或启用按钮
     * @function
     * @name Neter.RadioGroup.prototype.disabled
     * @param {String} item 要操作的按钮名称，可以为多个，省略则禁用所有
     * @param {Boolean} [status=true] 禁用（true）还是启用（false）按钮
     * @return {Neter.RadioGroup} 返回插件引用
     */
    disabled : function(name/*[, name[, ...]]*/, status) {
        var nameList = [],
            flag     = false,
            defaults = this.defaults;
        switch (arguments.length) {
            // 禁用所有按钮
            case 0:
                flag   = true;
                status = true;
                break;
            // 禁用或启用所有按钮
            case 1:
                if (typeof name === 'boolean') {
                    flag   = true;
                    status = !!status;
                }
                break;
            // 禁用或启用指定按钮
            default :
                nameList = [].slice.call(arguments);
                status   = !!nameList.pop();
                break;
        }
        
        $.each(this.handler.radios, function(index, value) {
            if (flag || ~$.inArray(value.name, nameList)) {
                status
                    ? value.icon.addClass(
                        value.selected
                            ? (value.icon.removeClass(defaults.ICON_SELECTED_CLASS), defaults.ICON_SELECTED_DISABLED_CLASS)
                            : defaults.ICON_DISABLED_CLASS
                      )
                    : (value.icon.hasClass(defaults.ICON_SELECTED_DISABLED_CLASS) && value.icon.addClass(defaults.ICON_SELECTED_CLASS), value.icon.removeClass(defaults.ICON_SELECTED_DISABLED_CLASS + ' ' + defaults.ICON_DISABLED_CLASS));
                value.disabled = status;
            }
        });

        return this;
    }
});