/**
 * 多选按钮组插件
 * @author Ly
 * @date 2012/12/19
 */
;Neter.namespace('Neter.CheckboxGroup');

/**
 * @class
 * @name Neter.CheckboxGroup
 * @param {Object} options 自定义配置信息
<pre>
    options = {
    // 承载按钮的默认容器，在insert中可以单独指定特例
    container     : document.body,
    // 按钮组名称
    groupName     : 'neter_checkbox_' + Neter.count(),
    // 选择事件，返回false则不选中
    selectedEvent : null,
    // 显示方式，默认为h（横向）/v（纵向）
    showType      : 'h',
    // 默认的按钮集合
    checkboxes    : []
}
</pre>
 */
;Neter.CheckboxGroup = function(options) {
    var _this = this;

    this.defaults = {
        // 承载按钮的默认容器，在insert中可以单独指定特例
        container     : document.body,
        // 按钮组名称
        groupName     : 'neter_checkbox_' + Neter.count(),
        // 选择事件，返回false则不选中
        selectedEvent : null,
        // 显示方式，默认为h（横向）/v（纵向）
        showType      : 'h',
        // 默认的按钮集合
        checkboxes    : []
    };

    Neter.apply(this.defaults, options, {
        LAYOUT_H_CLASS               : 'neter-checkbox-group-checkbox',
        LAYOUT_V_CLASS               : 'neter-checkbox-group-checkbox-v',
        ICON_NORMAL_CLASS            : 'neter-checkbox-group-checkbox-icon',
        ICON_SELECTED_CLASS          : 'neter-checkbox-group-checkbox-icon-selected',
        ICON_DISABLED_CLASS          : 'neter-checkbox-group-checkbox-icon-disabled',
        ICON_SELECTED_DISABLED_CLASS : 'neter-checkbox-group-checkbox-icon-selected-disabled'
    });

    this.handler = {
        container : this.defaults.container,
        checkboxes    : []
    };

    /** @ignore */
    this.method = {
        /**
         * 根据名称获取配置信息
         * @param {String} item 按钮名称
         * @return {Object} 按钮配置信息
         */
        getOptions : function(item) {
            var checkboxes = _this.handler.checkboxes;
            
            for (var i = 0, len = checkboxes.length; i < len; ++i) {
                if (checkboxes[i].name === item || checkboxes[i].checkbox.get(0) === item) {
                    return checkboxes[i];
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
                checkbox     = $('<span></span>').addClass('neter-checkbox-group-checkbox').appendTo(container),
                // 创建按钮图标
                icon      = $('<span><b></b></span>').addClass(defaults.ICON_NORMAL_CLASS).appendTo(checkbox),
                // 创建按钮标签
                label     = $('<span></span>').addClass('neter-checkbox-group-checkbox-label').append(options.tag).appendTo(checkbox);

            var childrens = container.find('span.neter-checkbox-group-checkbox');

            index = index < 0 ? (childrens.length > 0 ? childrens.length : 0) : index;
            
            // 插入到指定位置
            index !== (childrens.length - 1) && checkbox.insertBefore(childrens.get(index));

            // 缓存
            handler.checkboxes.splice(index, 0, Neter.apply(options, { checkbox : checkbox, icon : icon, label : label }));

            this.bindEvents(checkbox, options).updateStatus(icon, options);

            return this;
        },
        /** @ignore */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            $.each(handler.checkboxes, function(index, item) {
                item.checkbox[defaults.showType === 'v' ? 'addClass' : 'removeClass']('neter-checkbox-group-checkbox-v');
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
                
                if (typeof defaults.selectedEvent === 'function' && defaults.selectedEvent.call(this, _this, Neter.apply({}, options, ['checkbox', 'icon', 'label']), event) === false) {
                    return ;
                }

                if (options.disabled) { return ; }
                
                _this.method[options.selected ? 'unselected' : 'selected']($(this).get(0));
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
         * @param {HTMLDOM} item 按钮图标对象，省略则选中所有按钮
         * @ignore
         */
        selected : function(item/*[,[item[,...]]]*/) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this,
                cls      = defaults.ICON_SELECTED_CLASS,
                items    = $.map([].slice.call(arguments), function(item) {
                    var o = method.getOptions(item);
                    
                    return o ? o.icon.get(0) : null;
                });

            
            if (arguments.length) {
                $.each(handler.checkboxes, function(index, item) {
                    if (~$.inArray(item.icon.get(0), items)) {
                        item.selected = !!item.icon.addClass(cls);
                    }
                });
            } else {
                $.each(handler.checkboxes, function(index, item) {
                    item.selected = item.icon.addClass(cls);
                });
            }

            return this;
        },
        /**
         * 取消选中
         * @param {HTMLDOM} item 按钮图标对象，省略则取消选中所有按钮
         * @ignore
         */
        unselected : function(item/*[,[item[,...]]]*/) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this,
                cls      = defaults.ICON_SELECTED_CLASS,
                items    = $.map([].slice.call(arguments), function(item) {
                    var o = method.getOptions(item);
                    
                    return o ? o.icon.get(0) : null;
                });
            
            if (arguments.length) {
                $.each(handler.checkboxes, function(index, item) {
                    if (~$.inArray(item.icon.get(0), items)) {
                        item.selected = !!!item.icon.removeClass(cls);
                    }
                });
            } else {
                $.each(handler.checkboxes, function(index, item) {
                    item.selected = !!!item.icon.removeClass(cls);
                });
            }
            

            return this;
        }
    };
};

;Neter.apply(Neter.CheckboxGroup.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.CheckboxGroup.prototype.render
     * @return {Neter.CheckboxGroup} 返回插件引用
     */
    render : function() {
        var method = this.method;

        $.each(this.defaults.checkboxes || [], function(index, item) {
            method.create(-1, item);
        });

        method.initLayout();

        return this;
    },
    /**
     * 插入一个新的单选钮
     * @function
     * @name Neter.CheckboxGroup.prototype.insert
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
     * @return {Neter.CheckboxGroup} 返回插件引用
     */
    insert : function(index, options) {
        this.method.create(index, options).initLayout();

        return this;
    },
    /**
     * 更新单选钮
     * @function
     * @name Neter.CheckboxGroup.prototype.insert
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
     * @return {Neter.CheckboxGroup} 返回插件引用
     */
    update : function(name, options) {
        var handler = _this.handler,
            item    = this.method.getOptions(name);

        if (!item) { return this; }

        item.tag !== options.tag && handler.label.empty().append(options.tag);
        options.selected && this.selected(name);
        options.disabled && this.disabled(name, true);

        Neter.apply(item, options, {}, ['checkbox', 'icon', 'label', 'name']);

        return this;
    },
    /**
     * 删除按钮，或插件
     * @function
     * @name Neter.CheckboxGroup.prototype.remove
     * @param {Number|String} [item] 要删除的按钮索引或名称，可以是多个参数若省略参数则删除插件
     * @return {Null|Neter.CheckboxGroup} 删除按钮返回插件引用，删除插件时返回null
     */
    remove : function(item/*[, item[, ...]]*/) {
        if (arguments.length) {
            var checkboxes = this.handler.checkboxes,
                items  = [].slice.call(arguments);

            for (var i = checkboxes.length - 1; i < len; ++i) {
                if (~$.inArray(checkboxes[i].name, items)) {
                    checkboxes[i].checkbox.remove();
                    checkboxes[i].icon  = null;
                    checkboxes[i].label = null;
                    checkboxes[i].checkbox = null;
                }
            }
        } else {
            $.each(this.handler.checkboxes, function(index, value) {
                value.checkbox.remove();
                value.icon  = null;
                value.label = null;
                value.checkbox = null;
            });

            this.handler.checkboxes = [];

            return null;
        }

        return this;
    },
    /**
     * 设置或获取按钮显示方式
     * @function
     * @name Neter.CheckboxGroup.prototype.showType
     * @param {String} type 按钮显示方式，h/v;省略则返回当前的显示方式
     * @return {String|Neter.CheckboxGroup} type省略时返回当前的显示方式，否则返回插件引用
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
     * @name Neter.CheckboxGroup.prototype.updateSelectedEvent
     * @param {Function} handler 要更新的事件
     * @return {Neter.CheckboxGroup} 返回插件引用
     */
    updateSelectedEvent : function(handler) {
        if (typeof handler === 'function') {
            this.defaults.selectedEvent = handler;
        }
        return this;
    },
    /**
     * 选中或获取选中的按钮
     * @function
     * @name Neter.CheckboxGroup.prototype.selected
     * @param {String} [name] 要选择的按钮名称，省略则获取当前选中的按钮；仅一个true参数时选中所有按钮。
     * @return {Neter.CheckboxGroup} 返回插件引用
     */
    selected : function(name/*[,[name[,...]]]*/) {
        var method  = this.method,
            current = [];

        if (!arguments.length) {
            $.each(this.handler.checkboxes, function(index, value) {
                value.selected && current.push(Neter.apply({}, value, ['checkbox', 'icon', 'label', 'selected']));
            });

            return current;
        }

        arguments.length === 1 && name === true
            ? method.selected()
            : method.selected.apply(method, arguments);

        return this;
    },
    /**
     * 取消选中或获取位选中按钮
     * @function
     * @name Neter.CheckboxGroup.prototype.selected
     * @param {String} [name] 要取消选择的按钮名称，省略则获取当前未选中的菜单；仅一个true参数时取消选中所有按钮。
     * @return {Neter.CheckboxGroup} 返回插件引用
     */
    unselected : function(name/*[,[name[,...]]]*/) {
        var method  = this.method,
            current = [];

        if (!arguments.length) {
            $.each(this.handler.checkboxes, function(index, value) {
                !value.selected && current.push(Neter.apply({}, value, ['checkbox', 'icon', 'label', 'selected']));
            });

            return current;
        }

        arguments.length === 1 && name === true
            ? method.unselected()
            : method.unselected.apply(method, arguments);


        return this;
    },
    /**
     * 禁用或启用按钮
     * @function
     * @name Neter.CheckboxGroup.prototype.disabled
     * @param {String} item 要操作的按钮名称，可以为多个，省略则禁用所有
     * @param {Boolean} [status=true] 禁用（true）还是启用（false）按钮
     * @return {Neter.CheckboxGroup} 返回插件引用
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
        
        $.each(this.handler.checkboxes, function(index, value) {
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