/**
 * 面板示例页
 * @author Ly
 * @date 2012/11/14
 */
$(function() {
	loadThemes();
	var tips = new Neter.Tips({
			container : Math.random() > 0.5 ? $('#container') : $(document.body),
			msg       : '加载中. . .'
		}).render().show('aside', true);
	
	var panel = new Neter.Panel({
		container : $('#login'),
		bodies    : [{
			tag     : '邮箱账号登录',
			content : $('#account')
		}, {
			tag     : '手机号登录',
			content : '手机号'
		}]
	}).render();
	
	// 在第二个位置上插入一个新的标签
	panel.insert(1, {
		tag     : '自定义',
		content : '自定义'
	});
	
	// 将第二个标签修改为综合搜索
	panel.update(1, {
		tag     : 'Google搜索',
		content : '搜索结果'
	});
	
	Neter.log('面板视图区域高度：%dpx', panel.getView().height(), 'log');
	
	// 页面加载2秒后删除第二个标签
	setTimeout(function() {
		tips.update('2秒后删除了第二个标签').show('warning');
		panel.remove(1);
	}, 2 * 1000);
	
	setTimeout(function() { tips.hide(); }, 1000);
	
	// 代理页面中的事件
	$(document)
	.on('click','#autoLoginOptions', function() {
		this.checked && tips.update('最近两周将会自动登录').show('success');
	})
	.on('click', '#loginBtn', function() {
		$(document.body).fadeOut('slow', function() { location.href = 'main.html'; });
	})
	.on('click', '#regBtn', function() {
		tips.update('系统维护中，稍候再注册').show('warning');
	});
});

function loadThemes() {
	var themes  = ['winter', 'thanksgiving1', 'thanksgiving2', 'thanksgiving3', 'thanksgiving4', 'window1', 'window2', 'window3', 'para'],
		current = themes[Math.floor(Math.random() * 100) % themes.length];
	
	$('#center').css('background', 'url(resources/images/' + current + '_bg.jpg) repeat 0 0');
	$('#container').css('background', 'url(resources/images/' + current + '.jpg) no-repeat 0 0');
}