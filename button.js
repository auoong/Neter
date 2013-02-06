/**
 * 按钮插件
 * @author Ly
 * @date 2012/12/08
 */
;Neter.namespace('Neter.Button');

/**
 * @class
 * @requires Neter.Box
 * @requires Neter.DropDownMenu
 * @name Neter.Button
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 options = {
    container  : document.body,    // 按钮容器
    name       : '',               // 按钮名称
    disabled   : false,            // 是否禁用，默认为false
    front      : null,             // 按钮名称前缀
    split      : false,            // 是否下拉菜单与按钮分离，默认为false，若为true，则仅单击下拉按钮才能显示下拉菜单。
    menus      : null,             // 按钮的下拉菜单配置信息，如果有下拉菜单会在按钮右侧出现一个下拉箭头
    clickEvent : null,             // 按钮的单击事件
    modify     : false             // 触发按钮的下拉菜单是否直接替换按钮原有名称，默认false
 }
 </pre>
 */
;Neter.Button = function(options) {
    var _this = this;

    this.defaults = {
        container   : document.body,    // 按钮容器
        name        : '',               // 按钮名称
        disabled    : false,            // 是否禁用，默认为false
        front       : null,             // 按钮名称前缀
        split       : false,            // 是否下拉菜单与按钮分离，默认为false，若为true，则仅单击下拉按钮才能显示下拉菜单。
        slideHeight : 0,                // 显示时滑动的高度差
        menus       : null,             // 按钮的下拉菜单配置信息，如果有下拉菜单会在按钮右侧出现一个下拉箭头
        clickEvent  : null,             // 按钮的单击事件
        modify      : false             // 触发按钮的下拉菜单是否直接替换按钮原有名称，默认false
    };

    Neter.apply(this.defaults, options, {
        STATUS : ['normal', 'hover', 'active']
    });

    this.handler = {
        container : this.defaults.container,
        button    : null,
        label     : null,
        front     : null,
        arrow     : null,
        menu      : null
    };

    this.defaults.container = null;

    /** @ignore */
    this.method = {
        /**
         * 下拉菜单的默认事件
         * @ignore
         */
        menuEvent : function(menu, options, event) {
            var defaults = _this.defaults;

            typeof defaults.clickEvent === 'function'
                    && defaults.clickEvent.call(this, _this, Neter.apply({}, options, ['el', 'subMenus', 'selected']), event);

            defaults.modify && _this.handler.label.html(options.name);

            menu.hide();
        },
        /**
         * 创建框架 
         * @ignore
         */
        create : function() {
            var defaults = _this.defaults,
                handler  = _this.handler,
                method   = this;

            // 创建按钮
            handler.button = $('<div></div>').addClass('neter-button')
                .append(handler.front     = $('<span></span>').addClass('neter-button-front').append(defaults.front))
                .append(handler.label     = $('<span></span>').addClass('neter-button-label').append(defaults.name))
                .append(handler.separator = $('<span></span>').addClass('neter-button-separator'))
                .append(handler.arrow     = $('<span></span>').addClass('neter-button-arrow-down').append($('<b></b>')))
                .appendTo(handler.container);

            defaults.disabled && handler.button.addClass('neter-button-disabled');

            // 创建下拉菜单项
            defaults.menus instanceof Array
                && defaults.menus.length
                && handler.arrow.show()
                && (handler.menu = new Neter.DropDownMenu({
                    trigger     : handler.button,
                    mode        : 'noevent',
                    showStatus  : false,
                    slideHeight : defaults.slideHeight,
                    items       : defaults.menus,
                    menuEvent   : method.menuEvent
                }).render())
                && handler.button.addClass('ddm')
                && handler.label.addClass(defaults.split ? 'ddm-label-split' : 'ddm-label')
                && defaults.split && handler.separator.show();

            defaults.front
                && handler.label.addClass('front')
                && handler.front.show();

            return this;
        },
        /**
         * 初始化布局
         * @ignore
         */
        initLayout : function() {
            return this;
        },
        /**
         * 绑定事件
         * @ignore
         */
        bindEvents : function() {
            var defaults = _this.defaults,
                handler  = _this.handler;

            handler.button.on('click', 'span', function(event) {
                if (defaults.disabled) { return ; }

                // 由于给body注册了关闭菜单项事件，因此事件不能冒泡
                event.stopPropagation();

                // 显示下拉菜单
                defaults.split
                    ? $(this).hasClass('neter-button-arrow-down')
                        && handler.menu
                        && handler.menu.show()
                    : handler.menu && handler.menu.show();

                // 有子菜单或split==true则不进行影响按钮事件
                if (defaults.menus instanceof Array && defaults.menus.length) {
                    if (defaults.split && !$(this).hasClass('neter-button-arrow-down')) {
                    } else {
                        return ;
                    }
                }

                typeof defaults.clickEvent === 'function'
                    && defaults.clickEvent.call(this, _this, { name : defaults.name}, event);

            })
            .on('mouseenter', function(event) {
                if (defaults.disabled) { return ; }

                handler.separator.addClass('neter-button-separator-ok');
                $(this).addClass('neter-button-hover');
            })
            .on('mouseleave', function(event) {
                if (defaults.disabled) { return ; }

                handler.separator.removeClass('neter-button-separator-ok');
                $(this).removeClass('neter-button-hover');
            })
            .on('mousedown', 'span', function(event) {
                if (defaults.disabled) { return ; }

                defaults.split && event.stopPropagation();

                $(this).addClass('neter-button-active');

                // 如果是front则需要把label也置为active
                $(this).hasClass('neter-button-front') && handler.label.addClass('neter-button-active')
                
                if (defaults.split) { return ; }
                handler.front.addClass('neter-button-active');
                handler.label.addClass('neter-button-active');
                handler.arrow.addClass('neter-button-active');
            })
            .on('mouseup', 'span', function(event) {
                if (defaults.disabled) { return ; }
                defaults.split && event.stopPropagation();

                $(this).removeClass('neter-button-active');
                $(this).hasClass('neter-button-front') && handler.label.removeClass('neter-button-active')

                if (defaults.split) { return ; }

                handler.front.removeClass('neter-button-active');
                handler.label.removeClass('neter-button-active');
                handler.arrow.removeClass('neter-button-active');
            });


            $('body').on('click', function() { handler.menu && handler.menu.hide(); });

            return this;
        }
    };
};

;Neter.apply(Neter.Button.prototype, {
    /**
     * 渲染插件
     * @function
     * @name Neter.Button.prototype.render
     * @return {Neter.Button} 返回插件引用
     */
    render : function() {
        this.method.create().initLayout().bindEvents();

        return this;
    },
    /**
     * 获取按钮插件的DOM对象
     * @function
     * @name Neter.Button.prototype.get
     * @return {jQueryDOM} 经过jQuery封装过的插件的DOM对象
     */
    get : function() {
        return this.handler.button;
    },
    /**
     * 按指定的状态进行显示按钮
     * @function
     * @name Neter.Button.prototype.show
     * @param {String} [type=normal] 要显示的状态，支持：normal/hover/active三种状态
     * @return {Neter.Button} 返回插件引用
     */
    show : function(type) {
        type = $.inArray(type, this.defaults.STATUS) ? type : 'normal';

        this.handler.button
            .removeClass('neter-button-hover neter-button-active')
            .addClass(type === 'normal' ? '' : 'neter-button-' + type);

        return this;
    },
    /**
     */
    hide : function() {
        var handler = this.handler,
            menu    = handler.menu;

        handler.button
            .removeClass('neter-button-hover neter-button-active')
            .addClass('neter-button');

        menu && menu.hide();

        return this;
    },
    /**
     * 触发按钮上绑定的单击事件
     * @function
     * @name Neter.Button.prototype.click
     * @return {Neter.Button} 返回插件引用
     */
    'click' : function() {
        this.handler.label.trigger('click');
        return this;
    },
    /**
     * 启用或禁止按钮
     * @function
     * @name Neter.Button.prototype.disabled
     * @param {Boolean} [status=false] false为启用按钮，true为禁用按钮
     * @return {Neter.Button} 返回插件引用
     */
    disabled : function(status) {
        this.defaults.disabled = status;
        this.handler.button[status ? 'addClass' : 'removeClass']('neter-button-disabled');

        return this;
    },
    /**
     * 更新按钮的单击事件
     * @function
     * @name Neter.Button.prototype.updateClickEvent
     * @param {Function} handler 新的按钮单击事件
     * @return {Neter.Button} 返回插件引用
     */
    updateClickEvent : function(handler) {
        typeof handler === 'function'
            && (this.defaults.clickEvent = handler);

        return this;
    },
    /**
     * 删除按钮插件
     * @function
     * @name Neter.Button.prototype.remove
     * @return {Null} 返回null值
     */
    remove : function() {
        var handler = this.handler;

        handler.menu && handler.menu.remove(true);

        handler.button.remove();

        return null;
    }
});