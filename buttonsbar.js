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
Neter.ButtonsBar = function(options) {
	var _this = this;

	this.defaults = {
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
		buttonsBar : null,
		// 按钮数组
		buttons    : []
	};

	/** @ignore */
	this.method = {
		/**
		 * @ignore
		 */
		create : function() {
			return this;
		},
		/** @ignore */
		initLayout : function() {
			return this;
		},
		/** @ignore */
		bindEvents : function() {
			return this;
		},
		/**
		 * @ignore
		 */
		insert : function(index, options, parentButton) {
			
		}
	};
};

;Neter.apply(Neter.ButtonsBar.prototype, {
	/**
	 */
	render : function() {
		var method = this.method;

		method.create().initLayout().bindEvents();

		$.each(this.defaults.buttons, function(index, item) {
			method.insert(-1, item);
		});

		return this;
	},
	insert : function(index, options, parentButton) {

	},
	remove : function(item) {

	},
	updateClickEvent : function(handler) {

	},
	selected : function(item) {

	}
});