/**
 * 按钮组插件
 * @author Ly
 * @date 2012/12/13
 */
;Neter.namespace('Neter.ButtonsBar');

/**
 * @class
 * @requires Neter.Button
 * @name Neter.ButtonsBar
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 */
;Neter.ButtonsBar = function(options) {
    var _this = this;

    this.defaults = {
        container : document.body,
        // 是否保持按钮选中的状态，即按下状态，默认为false
        // 如果为true则会屏蔽掉所有按钮的下拉菜单
        keepStatus : false,
        // 所有按钮的共有事件
        clickEvent : null,
        // 要加载的按钮项
        buttons    : null
    };

    Neter.apply(this.defaults, options, {

    });

    this.handler = {
        container  : this.defaults.container,
        buttonsBar : null,
        // 按钮数组
        buttons    : []
    };

    this.defaults.container = null;

    /** @ignore */
    this.method = {
        /** @ignore */
        getOptions : function(item) {
            var buttons = _this.handler.buttons;
            
            for (var i = 0, len = buttons.length; i < len; ++i) {
                var ret = null;
                switch (typeof item) {
                    case 'string':
                        ret = buttons[i].name === item ? buttons[i] : null;
                        break;
                    case 'number':
                        ret = String(i) === String(item) ? buttons[i] : null;
                        break;
                }
                
                if (ret) { return ret; }
            }
            
            return null;
        },
        /** @ignore */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            handler.buttonsBar = $('<div></div>').addClass('neter-buttons-bar')
                .appendTo(handler.container);

            return this;
        },
        /** @ignore */
        initLayout : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            handler.buttonsBar.children().each(function(index) {
                $(this).css('margin-right', '-1px');

                index && $(this).css({
                    'border-top-left-radius'  : 0,
                    'border-bottom-left-radius' : 0
                });
            });

            return this;
        },
        /** @ignore */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            handler.buttonsBar
            .on('mousedown', function() {
                $.each(handler.buttons, function(index, button) {
                    button.button.hide();
                });
            })
            .on('mouseup', '.neter-button', function(event) {
                handler.buttonsBar
                    .find('.neter-button-front,.neter-button-label,.neter-button-arrow-down')
                    .removeClass('neter-button-active');

                 // 实现保持状态逻辑
                defaults.keepStatus &&
                    $(this).find('.neter-button-front,.neter-button-label,.neter-button-arrow-down')
                        .addClass('neter-button-active');
            });

            return this;
        },
        /** @ignore */
        insert : function(index, options) {
            var defaults = _this.defaults,
                handler  = _this.handler,
                buttons  = handler.buttons;

            index = index < 0 ? (buttons.length > 0 ? buttons.length : 0) : index;

            if (typeof options.name === 'undefind') {
                Neter.log('无法调用insert方法，参数options中未定义name属性。', 'warning');
                return this;
            }
            
            Neter.apply(options, {
                container  : handler.buttonsBar,
                clickEvent : defaults.clickEvent
            });

            // 若keepStatus=true则屏蔽掉下拉菜单
            defaults.keepStatus && delete options.menus;

            options.button = new Neter.Button(options).render();

            var childrens = handler.buttonsBar.children();

            index !== (childrens.length - 1) && options.button.get().insertBefore(childrens.get(index));

            buttons.splice(index, 0, options);

            return this;
        }
    };
};

;Neter.apply(Neter.ButtonsBar.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.ButtonsBar.prototype.render
     * @return {Neter.ButtonsBar} 返回插件引用
     */
    render : function() {
        var method = this.method;

        method.create().initLayout().bindEvents();

        $.each(this.defaults.buttons, function(index, item) {
            method.insert(-1, item);
        });

        method.initLayout();

        return this;
    },
    /**
     * 插入一个按钮
     * @function
     * @name Neter.ButtonsBar.prototype.insert
     * @param {Number} index 要插入的位置，-1为插入到最后。
     * @param {Object} options 按钮配置信息。参照Neter.Button的配置信息。
     * @return {Neter.ButtonsBar} 返回插件引用
     */
    insert : function(index, options) {
        this.method.insert(index, options).initLayout();

        return this;
    },
    /**
     * 删除按钮项，或者删除插件
     * @function
     * @name Neter.ButtonsBar.prototype.remove
     * @param {Number|String} item 要删除的项索引，或名称。若省略参数为删除所有项，仅传递true时删除插件。
     * @return {Neter.ButtonsBar|Null} 返回插件引用，删除插件是返回null
     */
    remove : function(item) {
        var handler    = this.handler,
            buttonsBar = handler.buttonsBar,
            buttons    = handler.buttons,
            method     = this.method,
            items      = [].slice.call(arguments);

        if (item === true) { items = buttons; }

        if (!arguments.length) {
           items = $.map(buttons, function(value) { return value.name; });
        }

        $.each(items, function(index, item) {
            item = method.getOptions(item);

            item
                && item.button.remove()
                && (item.button = null);
        });

        if (item === true) {
            handler.buttonsBar.remove();
            handler.buttonsBar = null;
            return null;
        }

        return this;
    },
    /**
     * 更新按钮的单击事件
     * @function
     * @name Neter.ButtonsBar.prototype.updateClickEvent
     * @param {Function} handler 新的按钮单击事件
     * @return {Neter.ButtonsBar} 返回插件引用
     */
    updateClickEvent : function(handler) {
        if (typeof handler === 'function') {
            this.defaults.clickEvent = handler;
        }

        return this;
    },
    /**
     * 选择一个按钮
     * @function
     * @name Neter.ButtonsBar.prototype.selected
     * @param {Number|String} item 要选中的按钮索引或名称
     */
    selected : function(item) {
        var handler = this.handler;

        $.each(handler.buttons, function(index, value) {
            (typeof item === 'number' ? index === item : value.name === item)
                && value.button.click().get().trigger('mouseup');
        });

        return this;
    }
});