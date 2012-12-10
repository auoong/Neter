/**
 * 折叠菜单插件
 * @author Ly
 * @date 2012/11/22
 */
;Neter.namespace('Neter.Accordion');

/**
 * @class
 * @name Neter.Accordion
 * @param {Object} options 自定义配置信息，默认配置信息如下：
 <pre>
 	options = {
		container       : document.body,           // 菜单容器
		width           : 200,
		height          : '100%',
		autoFold        : false,                   // 展开一个菜单组自动折叠其他的，默认false
		itemEvent       : null,                    // 菜单项事件
		removeItemEvent : null,                    // 删除菜单项事件
		groupItemEvent  : null,                    // 菜单项组事件
		items           : []                       // 菜单项集合
	}
 </pre>
 */
;Neter.Accordion = function(options) {
	var _this = this;
	
	this.defaults = {
		container       : document.body,           // 菜单容器
		width           : 200,
		height          : '100%',
		autoFold        : false,                   // 展开一个菜单组自动折叠其他的，默认false
		itemEvent       : null,                    // 菜单项事件
		removeItemEvent : null,                    // 删除菜单项事件
		groupItemEvent  : null,                    // 菜单项组事件
		items           : []                       // 菜单项集合
	};
	
	Neter.apply(this.defaults, options, {
		// 菜单组标题高度
		ITEM_HEIGHT  : 32,
		// 菜单项距左位置
		PADDING_LEFT : 26
	});
	
	this.handler = {
		container : this.defaults.container,
		accordion : null,
		menus     : []
	};
	
	this.defaults.container = null;
	
	this.method = {
		/**
		 * 获取菜单项配置信息
		 * @private
		 * @name Neter.Accordion.getOptions
		 * @param {Number|String|HTMLElement} item 菜单项索引值或菜单项名称或菜单项对象
		 * @return {Object} 菜单项配置信息，若未找到返回null
		 */
		getOptions : function(item) {
			var menus    = _this.handler.menus,
				subMenus = null,
				index    = null,
				ret      = null;
			
			for (var i = 0, len = menus.length; i < len; ++i) {
				subMenus = null;
				ret      = null;
				switch (typeof item) {
					case 'object':
						ret = menus[i].el && item === menus[i].el.children().first().get(0) ? menus[i] : null;
						break;
					case 'string':
						if (!/^[\d,]+$/.test(item)) {
							ret = menus[i].name === item ? menus[i] : null;
							break;
						}
					case 'number':
						index = String(item).split(',');
						if (ret = String(i) === String(index[0]) ? menus[i] : null) {
							item = typeof index[1] === 'undefined' ? -2 : Number(index[1]);
						}
						break;
				}
				
				// 遍历当前菜单的子菜单，即若当前菜单为菜单组时
				if (subMenus = menus[i].subMenus) {
					for (var j = 0, len2 = subMenus.length; j < len2; ++j) {
						switch (typeof item) {
							case 'object':
								ret = subMenus[j].el && item === subMenus[j].el.children().first().get(0) ? subMenus[j] : null;
								break;
							case 'string':
								ret = subMenus[j].name === item ? subMenus[j] : null;
								break;
							case 'number':
								ret = j === item ? subMenus[j] : null;
								ret = item === -1 ? subMenus[len2 - 1] : ret;
								break;
						}
					}
				}
				
				if (ret) {
					return ret;
				}
			}
			
			return null;
		},
		/**
		 * 获取菜单项索引值
		 * @ignore
		 * @param {Number|String|HTMLElement} item 要查询的菜单项索引值（主要针对取最后一个菜单项，传-1）或菜单名，或菜单对象
		 * @return {Number|String} 返回菜单项索引值，如果是一个子菜单，则返回的是一个由逗号分隔的字符串
		 */
		getIndex : function(item) {
			var menus    = _this.handler.menus,
				subMenus = null,
				ret      = null;
			
			if (String(item) === String(-1)) { return menus.length; }
			
			for (var i = 0, len = menus.length; i < len; ++i) {
				subMenus = null;
				ret      = -1;
				switch (typeof item) {
					case 'object':
						ret = menus[i].el && item === menus[i].el.children().first().get(0) ? i : -1;
						break;
					case 'string':
						if (!/^[\d,]+$/.test(item)) {
							ret = menus[i].name === item ? i : -1;
							break;
						}
					case 'number':
						index = String(item).split(',');
						ret = String(i) === String(index[0]) ? i : (String(index[0]) === String(-1) ? (len - 1) : index[0]);
						if (!~ret) {
							item = typeof index[1] === 'undefined' ? -2 : Number(index[1]);
						}
						break;
				}
				
				// 遍历当前菜单的子菜单，即若当前菜单为菜单组时
				if (subMenus = menus[i].subMenus) {
					for (var j = 0, len2 = subMenus.length; j < len2; ++j) {
						switch (typeof item) {
							case 'object':
								ret = subMenus[j].el && item === subMenus[j].el.children().first().get(0) ? [i, j].join(',') : -1;
								break;
							case 'string':
								ret = subMenus[j].name === item ? [i, j].join(',') : -1;
								break;
							case 'number':
								ret = j === item ? j : -1;
								ret = String(item) === String(-1) ? subMenus[len2 - 1] : ret;
								break;
						}
					}
				}
				
				if (~ret) {
					return ret;
				}
			}
			
			return -1;
		},
		/**
		 * 获取菜单项所属堆栈
		 * @ignore
		 * @param {Number|String|HTMLElement} item 要查询的菜单项索引值（主要针对取最后一个菜单项，传-1）或菜单名，或菜单对象
		 * @return {Array} 返回菜单项所属堆栈，或者为null
		 */
		getStack : function(item) {
			var menus    = _this.handler.menus,
				subMenus = null,
				ret      = null;
			
			for (var i = 0, len = menus.length; i < len; ++i) {
				subMenus = null;
				ret      = null;
				switch (typeof item) {
					case 'object':
						ret = menus[i].el && item === menus[i].el.children().first().get(0) ? menus : null;
						break;
					case 'string':
						if (!/^[\d,]+$/.test(item)) {
							ret = menus[i].name === item ? menus : null;
							break;
						}
					case 'number':
						index = String(item).split(',');
						ret = String(i) === String(index[0]) ? menus : (index[0] == -1 ? (len - 1) : index[0]);
						if (!~ret) {
							item = typeof index[1] === 'undefined' ? -2 : Number(index[1]);
						}
						break;
				}
				
				// 遍历当前菜单的子菜单，即若当前菜单为菜单组时
				if (subMenus = menus[i].subMenus) {
					for (var j = 0, len2 = subMenus.length; j < len2; ++j) {
						switch (typeof item) {
							case 'object':
								ret = subMenus[j].el && item === subMenus[j].el.children().first().get(0) ? subMenus : null;
								break;
							case 'string':
								ret = subMenus[j].name === item ? subMenus : null;
								break;
							case 'number':
								ret = j === item ? subMenus : null;
								ret = item === -1 ? subMenus : ret;
								break;
						}
					}
				}
				
				if (ret) {
					return ret;
				}
			}
			
			return null;
		},
		/**
		 * 创建框架
		 * @ignore
		 */
		create : function() {
			var defaults = _this.defaults,
				handler  = _this.handler;
			
			// 创建折叠菜单
			handler.accordion = $('<div></div>').addClass('neter-accordion').appendTo(handler.container);
			
			return this;
		},
		/**
		 * 初始化布局
		 * @ignore
		 */
		initLayout : function() {
			var defaults = _this.defaults,
				handler  = _this.handler;
			
			// 设定插件宽度与高度，插件不带有边框线
			handler.accordion.css({
				width  : defaults.width,
				height : defaults.height
			});
			
			return this;
		},
		/**
		 * 绑定事件
		 * @ignore
		 */
		bindEvents : function() {
			var defaults = _this.defaults,
				handler  = _this.handler,
				method   = _this.method;
			
			handler.accordion
			// 菜单项事件
			.delegate('.neter-accordion-item', 'click', function(event) {
				(typeof defaults.itemEvent === 'function'
					&& defaults.itemEvent.call(this, _this, method.getOptions(this), event) === false)
				|| method.unselected().selected(this);
			})
			// 菜单组名事件
			.delegate('.neter-accordion-item-group', 'click', function(event) {
				(typeof defaults.itemEvent === 'function'
					&& defaults.itemEvent.call(this, _this, method.getOptions(this), event) === false)
				|| method.toggle(this);
			});
			
			return this;
		},
		/**
		 * 展开或折叠菜单组
		 * @ignore
		 * @param {Number|String|HTMLElement} item 菜单组对象索引值，或名称，或对象
		 */
		toggle : function(item) {
			var defaults = _this.defaults,
				handler  = _this.handler,
				groupItem;
			
			groupItem = this.getOptions(item).el.children().first();
			
			item = groupItem.parent();
			
			// 若容器高度是菜单项高度，则认为当前是隐藏状态
			if (item.height() == defaults.ITEM_HEIGHT) {
				item.animate({
					height : item.children().length * defaults.ITEM_HEIGHT
				}, 'fast');
				handler.accordion.find('.neter-accordion-item-front-unfold').removeClass('neter-accordion-item-front-unfold');
				groupItem.children().first().addClass('neter-accordion-item-front-unfold');
			} else {
				item.animate({
					height : defaults.ITEM_HEIGHT
				});
				groupItem.children().first().removeClass('neter-accordion-item-front-unfold');
			}
			
			return this;
		},
		/**
		 * 插入一个菜单项
		 * @ignore
		 */
		insert : function(index, options, parentItem) {
			var defaults = _this.defaults,
				handler  = _this.handler,
				method   = this,
				item     = {},
				prev     = null,
				container;
			
			index = this.getIndex(index);
			
			// 获取父菜单
			parentItem = typeof parentItem !== 'undefined' ? this.getOptions(parentItem) : null;
			
			container = options.name
				? $('<div></div>').addClass('neter-accordion-item-container')
					.append(item = $('<div></div>').addClass('neter-accordion-item')
						.append($('<div></div>').addClass('neter-accordion-item-front').append(options.front || null))
						.append($('<div></div>').addClass('neter-accordion-item-name').append(options.name))
						.append($('<div></div>').addClass('neter-accordion-item-rear').append(options.rear || null)))
					.appendTo(parentItem && parentItem.el || handler.accordion)
				: $('<div></div>').addClass('neter-accordion-separator')
					.appendTo(parentItem && parentItem.el || handler.accordion);
			
			options.front && item.find('.neter-accordion-item-front').show();
			options.rear && item.find('.neter-accordion-item-rear').show();
			
			parentItem
				&& (parentItem.group = true)
				&& (index = index < 0 ? parentItem.subMenus.length : index)
				&& parentItem.el.find('.neter-accordion-item').first().addClass('neter-accordion-item-group').children().first().show();
			// 获取要插入位置的菜单项
			prev = this.getOptions(index);
			// 将当前菜单插入到指定的位置
			container.insertBefore(prev ? prev.el : null);
			
			(parentItem && parentItem.subMenus || handler.menus).splice(index, 0, Neter.apply({}, options, { el : container, subMenus : [] }, ['subMenus']));
			
			options.subMenus
				&& options.subMenus.length
				&& $.each(options.subMenus, function(i, item) { method.insert(-1, item, index); });
			
			return this;
		},
		/**
		 * 选中一个菜单
		 * @ignore
		 * @param {Number|String|HTMLElement} item 要选择的菜单
		 * @param {Boolean} flag 是否要触发菜单事件，默认为false
		 */
		selected : function(item, flag) {
			var defaults = _this.defaults,
				handler  = _this.handler,
				el;
			
			item = this.getOptions(item);
			
			item
				&& item.el
				&& item.el.find('.neter-accordion-item:first:not(.neter-accordion-item-group)').addClass('neter-accordion-item-selected').trigger(flag ? 'click' : 'NO EVENT')
				&& (item.selected = true);
				
			return this;
		},
		/**
		 * 取消所有选中的菜单项
		 * @ignore
		 */
		unselected : function() {
			_this.handler.accordion.find('.neter-accordion-item-selected').removeClass('neter-accordion-item-selected');
			
			$.each(_this.handler.menus || [], function(index, item) {
				item.selected
					&& (item.selected = false);
				
				item.subMenus
					&& $.each(item.subMenus, function(index2, item2) {
						item2.selected
							&& (item2.selected = false);
					});
			});
			
			return this;
		}
	};
};

;Neter.apply(Neter.Accordion.prototype, {
	/**
	 * 渲染插件
	 * @function
	 * @name Neter.Accordion.prototype.render
	 * @return {Neter.Accordion} 返回插件引用
	 */
	render : function() {
		var defaults = this.defaults,
			method   = this.method;
		
		method.create().initLayout().bindEvents();
		
		(!defaults.items || defaults.items.length < 1) &&  Neter.log('Neter.Accordion渲染完成，但未指定菜单项...');
		
		$.each(this.defaults.items || [], function(index, item) {
			method.insert(-1, item);
		});
		
		return this;
	},
	/**
	 * 获取插件对象
	 * @function
	 * @name Neter.Accordion.prototype.get
	 * @return {jQueryDOM} 返回当前插件的DOM对象，使用jQuery包装过的。
	 */
	get : function() {
		return this.handler.accordion;
	},
	/**
	 * 插入一个菜单项
	 * @function
	 * @name Neter.Accordion.prototype.insert
	 * @param {Number|String|HTMLElement} index 要插入的位置，可以是一个索引值，也可以是菜单名称或对象，
	                                            如果传递的是菜单名称或对象，则占用此菜单的位置，当前菜单向下移动。
	 * @param {Object} options 菜单项配置信息
	 <pre>
	  		options = {
				name     : '菜单名称',               // 菜单名称，如果为空则认为是分隔线
				front    : HTMLElement,            // 菜单项前置对象
				rear     : HTMLElement,            // 菜单项后置对象
				selected : false,                  // 是否选中当前菜单
				subMenus : []                      // 子菜单项，当存在此参数时则当前菜单名为组名
			}
	</pre>
	 * @param {Number|String|HTMLElement} [parentItem] 将此菜单项加入到哪个分组中
	 * @return {Neter.Accordion} 返回插件引用
	 */
	insert : function(index, options, parentItem) {
		this.method.insert(index, options, parentItem);

		return this;
	},
	/**
	 * 更新菜单项信息
	 * @function
	 * @name Neter.Accordion.prototype.update
	 * @param {Number|String|HTMLElement} item 要更新的菜单项
	 * @param {Object} options 菜单项信息
	 * @return {Neter.Accordion} 返回插件引用
	 */
	update : function(item, options) {
		var current = this.method.getOptions(item);
		
		if (current) {
			var el = current.el.find('.neter-accordion-item:first');
			
			// 仅能更新菜单项，不能更新菜单组
			current.subMenus.length && options.front && el.children().first().empty().append(options.front).show();
			
			options.rear && el.children().last().empty().append(options.rear).show();
			
			options.name !== current.name && el.children('.neter-accodion-item-name').html(options.name);
			
			Neter.apply(current, options, {}, ['el', 'subMenus']);
		}
		
		return this;
	},
	/**
	 * 删除菜单
	 * @function
	 * @name Neter.Accordion.prototype.remove
	 * @param {Number|String|HTMLElement} index 要删除的菜单项，支持多个参数，不可以按索引值来删除菜单组下的菜单
	 * @return {Neter.Accordion} 返回插件引用
	 */
	remove : function(index/* [, index[,...]] */) {
		var method = this.method;
		
		$.each([].slice.call(arguments, 0) || [], function(index, item) {
			index = String(method.getIndex(item)).split(',').pop();
			items = method.getStack(item);
			item  = method.getOptions(item);
			
			// 仅删除不是菜单组的菜单
			if (item && !item.group) {
				item.el.empty().remove();
				
				item.el    = null;
				item.front = null;
				item.rear  = null;
				
				items.splice(index, 1);
			}
			
		});
		
		return this;
	},
	/**
	 * 将菜单项移动到一个菜单组中
	 * @function
	 * @name Neter.Accordion.prototype.move
	 * @param {Number|String|HTMLElement} group 菜单组索引值，或名称，或对象
	 * @param {Number|String|HTMLElement} item 要移动的菜单索引值，或名称，或对象，支持多个参数
	 * @return {Neter.Accordion} 返回插件引用
	 */
	move : function(group, item/* [,item[,...]] */) {
		var method = this.method;
		
		group = method.getOptions(group);
		
		if (!group || !group.group) {
			Neter.log('移动菜单失败，目标菜单组不存在！');
			return this;
		}
		
		$.each([].slice.call(arguments, 1) || [], function(index, item) {
			item = method.getOptions(item);
			
			if (item && !item.group) {
				group.el.append(item.el);
				
			} else {
				Neter.log('移动菜单失败，要移动的菜单不存在，或者是一个菜单组对象！');
			}
		});
		
		return this;
	},
	/**
	 * 选择一个菜单项
	 * @function
	 * @name Neter.Accordion.prototype.selected
	 * @param {Number|String|HTMLElement} item 要选择的菜单索引值，或名称，或对象，组是无法被选中的。选中的菜单如果属于一个菜单组则会自动展开。
	 * @param {Boolean} flag 是否要触发菜单的事件，默认为true
	 * @return {Neter.Accordion} 返回插件引用
	 */
	selected : function(item, flag) {
		this.method.selected(item, flag !== false);
		
		return this;
	},
	/**
	 * 展开菜单组
	 * @function
	 * @name Neter.Accordion.prototype.unfold
	 * @param {Number|String|HTMLElement} item 要展开的菜单索引值，或名称，或对象，支持多参数，省略则展开所有，若autoFold=true则当前仅展开最后一个。
	 * @return {Neter.Accordion} 返回插件引用
	 */
	unfold : function(item/* [, item[, ...]] */) {
		var defaults = this.defaults;
		
		$.each([].slice.call(arguments, 0) || [], function(index, item) {
			var groupItem = this.getOptions(item).el.children().first();
			
			item = groupItem.parent();
			
			item.animate({
				height : item.children().length * defaults.ITEM_HEIGHT
			}, 'fast');
			handler.accordion.find('.neter-accordion-item-front-unfold').removeClass('neter-accordion-item-front-unfold');
			groupItem.children().first().addClass('neter-accordion-item-front-unfold');
		});
		
		return this;
	},
	/**
	 * 折叠菜单组
	 * @function
	 * @name Neter.Accordion.prototype.fold
	 * @param {Number|String|HTMLElement} item 要折叠的菜单索引值，或名称，或对象，支持多参数。省略则折叠所有组。
	 * @return {Neter.Accordion} 返回插件引用
	 */
	fold : function(item/* [, item[, ...]] */) {
		var defaults = this.defaults;
		
		$.each([].slice.call(arguments, 0) || [], function(index, item) {
			var groupItem = this.getOptions(item).el.children().first();
			
			item = groupItem.parent();
			
			item.animate({
				height : defaults.ITEM_HEIGHT
			});
			groupItem.children().first().removeClass('neter-accordion-item-front-unfold');
		});
		
		return this;
	},
	/**
	 * 更新菜单项事件
	 * @function
	 * @name Neter.Accordion.prototype.mupdateItemEvent
	 * @param {Function} handler 事件句柄
	 * @return {Neter.Accordion} 返回插件引用
	 */
	updateItemEvent : function(handler) {
		typeof handler === 'function' && (this.defaults.itemEvent = handler);
		
		return this;
	},
	/**
	 * 更新菜单项删除事件
	 * @function
	 * @name Neter.Accordion.prototype.updateRemoveItemEvent
	 * @param {Function} handler 事件句柄
	 * @return {Neter.Accordion} 返回插件引用
	 */
	updateRemoveItemEvent : function(handler) {
		typeof handler === 'function' && (this.defaults.removeItemEvent = handler);
		
		return this;
	},
	/**
	 * 更新菜单项组事件
	 * @function
	 * @name Neter.Accordion.prototype.updateGroupItemEvent
	 * @param {Function} handler 事件句柄
	 * @return {Neter.Accordion} 返回插件引用
	 */
	updateGroupItemEvent : function(handler) {
		typeof handler === 'function' && (this.defaults.groupItemEvent = handler);
		
		return this;
	}
});