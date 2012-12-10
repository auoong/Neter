/**
 * 邮箱主页
 * @author Ly
 * @date 2012/11/15
 */
var navigation = null;
$(function() {
	Neter.path('../');
	
	$(window).resize(function() {
		var height = $('body').height() - $('#header').height();
		
		$('#view').css({
			height : $('body').height() - $('#header').height(),
			width  : '100%',
			top    : $('#header').height()
		});
	}).trigger('resize');
	
	// 加载皮肤
	new Neter.Skin().applying();
	
	var win = null;
	$('.user').click(function() {
		win = new Neter.Window({
			title   : '个人资料',
			content : 'Window...',
			buttons : [{
				name : '确定',
				cls  : 'neter-button-primary',
				clickEvent : function(win, options, event) {
					alert('不允许关闭');
					return false;
				}
			}, {
				name : '取消',
				clickEvent : function(win, options, event) {
					win.close();
				}
			}]
		}).render().content('我是更新后的内容...').title('重置后的标题...');
	});
	
	var box = null;
	var searchBar = new Neter.SearchBar({
		container     : $('#searchBar'),
		placeholder   : '支持邮件全文搜索',
		optionsWindow : $('#boxContent').show(),
		alignment     : 'right',
		searchEvent   : function(searchBar, keyword) {
			new Neter.Tips({ msg : keyword.val() || '没有输入关键字' }).render().show(keyword.val() ? 'success' : 'warning');
		}
	}).render();
	
	// 单击body关闭下拉选项框
	$(document.body).live('click', function() { searchBar.hideOptionsWindow(); });
	
	// 单击选项框中的取消时关闭下拉选项框
	$('#cancel').bind('click', function() {
		searchBar.hideOptionsWindow();
	});
	
	var timer = null;
	
	showMenu($('#header ul li.setting'));
	$(document.body).click(hideMenu)
	.delegate('#header ul li.setting', 'mouseenter', function() {
		var el = $(this);
		$(this).find('b').css({ backgroundImage : 'url(../resources/images/arrow_down_white.png)' });
		
	})
	.delegate('#header ul li.setting', 'mouseleave', function() {
		var el = $(this);
		$(this).find('b').css({ backgroundImage : 'url(../resources/images/arrow_down.png)' });
	})
	.delegate('#delBtn', 'click', function() {
		menu.remove('3,2');
	});
	
	// 增加导航条
	navigation = new Neter.Navigation({
		container : $('#navigationContainer'),
		view      : $('#view'),
		itemWidth : 91,
		itemEvent : function(navigation, options) {
			Neter.log('执行了itemEvent事件，标签名称：%s，内容：%s', options.name, options.url || options.content, 'info');
			
			// 切换导航项时自动选中下拉菜单中的菜单项
			navigation.optionsMenuTrigger('selected', options.name);
		},
		removeItemEvent : function(navigation, options) {
			navigation.optionsMenuTrigger('remove', options.name);
		},
		items : [
			{ name : '首页', url : 'template/home.html' },
			{ name : '通讯录', url : 'template/contact.html', closeButton : true },
			{ name : '邮箱应用设置', url  : 'template/app.html', closeButton : true },
			{ name : '收件箱', url : 'template/help.html', closeButton : true }
		],
		optionsStatus : true,
		optionsMenu   : [{ name : '关闭全部', front : $('<img>', { src : Neter.path() + 'resources/images/close_all.png' }) }],
		optionsMenuEvent : function(navigation, options, event) {
			options.name == '关闭全部' ? navigation.remove() : navigation.active(options.name);
		}
	})
	.render()
	.active(0)
	.update('邮箱应用', {
		name        : '邮箱应用',
		content     : 'template/app.html',
		url         : '',
		closeButton : Math.random() > .5    // 随机更新关闭按钮
	});

	// 加载触点插件
	var dock = new Neter.Dock({
		showType : 'v',
		blink : true,
		group : false,    // 为false时subApps不被加载；当true时，showType会强制设置为v
		items : [{
			name : '通讯录',
			icon : '../resources/images/apps/address_48.png',
			label : 2,
			data : '第一个测试程序',
			subApps : [{
				name : '游戏天地',
				icon : '../resources/images/apps/games_48.png'
			}, {
				name : '更新通知',
				icon : '../resources/images/apps/subscribe_48.png'
			}]
		}, {
			name : '邮箱应用',
			icon : '../resources/images/apps/app_48.png',
			data : 'email app'
		}, {
			name : '收件箱',
			icon : '../resources/images/apps/inbox_48.png'
		}, {
			name : '电子名片',
			icon : '../resources/images/apps/ecard_48.png'
		}, {
			name : '记事本',
			icon : '../resources/images/apps/notepad_48.png'
		}, {
			name : '日历',
			icon : '../resources/images/apps/calendar_48.png'
		}, {
			name : '星座',
			icon : '../resources/images/apps/constellation_48.png'
		}, {
			name : '理财易',
			icon : '../resources/images/apps/money_48.png',
			subApps : [{
				name : '车险',
				icon : '../resources/images/apps/chexian_48.png'
			}, {
				name : '网上订票',
				icon : '../resources/images/apps/huoche_48.png'
			}, {
				name : '网上订票',
				icon : '../resources/images/apps/huoche_48.png'
			}, {
				name : '网上订票',
				icon : '../resources/images/apps/huoche_48.png'
			}, {
				name : '网上订票',
				icon : '../resources/images/apps/huoche_48.png'
			}, {
				name : '网络购物',
				icon : '../resources/images/apps/quan_48.png'
			}]
		}, {
			name : '成语词典',
			icon : '../resources/images/apps/idiomdict_48.png'
		}, {
			name : '音乐盒1',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒2',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒3',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒4',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒5',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒6',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒7',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒8',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒9',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒10',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒11',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒12',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒13',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒14',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒15',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒16',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒17',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒18',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒19',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒20',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒21',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒22',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒23',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒24',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒25',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '音乐盒26',
			icon : '../resources/images/apps/music_48.png'
		}, {
			name : '实验室',
			icon : '../resources/images/apps/lab_48.png'
		}],
		itemEvent : function(dock, options, type, event) {
			Neter.log("单击了%s中的应用程序，配置信息为：%o", type, options, 'info');
		}
	}).render();
});

var menu,
	about;

function showMenu(el) {
	menu = (menu || new Neter.DropDownMenu({
		trigger : el,
		mode    : 'click',
		showStatus : false,
		items   : [{
			name  : '邮箱设置',
			email : 'auoong@163.com',
			front : $('<div></div>').css({
				height     : 20,
				background : 'url(' + Neter.path() + 'resources/images/mail.png) no-repeat 3px 5px'
			})
		},
		{ name : '' },
		{ name : '换肤' },
		{ name : '实验室', subMenus : [
			{ name : '邮件分享'},
			{ name : '给我写信'},
			{ name : '邮箱本地存储', subMenus : [
				{ name : '转存到硬盘' },
				{ name : '转存到U盘' },
				{ name : '' },
				{ name : '保存至SQLite', mark : 'sqlite...'}
			]}
		]},
		{ name : '邮箱帮助' }
		],
		menuEvent : function(dropDownMenu, options) {
			Neter.log('菜单项名称：%s，附加数据：%s', $(this).text(), options.email || '', 'log');
			
			if (options.name == '换肤') {
				navigation.getIndex('换肤') == -1 && navigation.insert(-1, { name : '换肤', closeButton : true, url : 'template/skin.html' });
				
				navigation.active('换肤').optionsMenuTrigger('insert', -1, { name : '换肤', selected : true });
			}
			dropDownMenu.hide();
		}
	})
	.render()
	// 自动选择菜单，并且触发事件
	.selected('3,2,1'));
}

function hideMenu() {
	menu && menu.hide();
}