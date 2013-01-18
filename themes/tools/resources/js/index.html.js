var loadedThemes = false,
    themes = {},
    cssBlock = [],
    cp       = {},
    comBox;

var parser = new Parser().init();

parser.load();

$(function() {
    $('#right').width($(document).width() - $('#left').outerWidth());

    Neter.path('../../');

    $('#left>ul li').on('click', function() {
        $('#left li').removeClass('selected');
        $('#themesListContainer')[$(this).addClass('selected').html() === '修改现有主题' ? (loadThemes(), 'show') : 'hide']();
    }).first().trigger('click');

    // 单击标题展开
    $('#left div.title h1').on('click', function() {
        $('#left div.title h1').removeClass('expand').parent().next('.content').hide();
        $(this).addClass('expand');
        $(this).parent().next('.content').show();
    }).first().trigger('click');

    // 全局样式设定tr事件
    $('#left table tr').on('mouseenter', function(event) {
        $('#left table tr').removeClass('current-line');
        $(this).addClass('current-line');
    });

    initPage();

    $('#saveBtn').on('click', function() {
        var tn = $('#themesName').val();

        if (themes[tn]) {
            if (!confirm('此主题已经存在，是否覆盖？')) {
                return false;
            }
        }
        var n = $('#fileName').val();

        themes[tn] = n.indexOf('.') ? n : n + '.css';

        parser.saveCss(tn, themes[tn], themes);
        
        return false;
    });

    $.getJSON('../manifest.json', function(json) {
        themes = json;
    });
});

function initPage() {
    if (parser.status()) {
        // 加载CSS内容
        loadCSSData('global', 'neter-accordion', 'neter-navigation', 'neter-dock');

        bindRealTimeEvents();

        var win = $('#view').get(0).contentWindow;

        if (win) {
            win.stopAutoLoadThemes();
            win.loadThemes();
        }
    } else {
        setTimeout(initPage, 1000);
    }
}

function loadCSSData(css) {
    $.each(cssBlock = [].slice.call(arguments), function(index, css) {
        css = parser.get(css);

         for (var p in css) {
            if (~p.indexOf('color') || ~p.indexOf('background')) {
                cp[p] = new Neter.ColorPicker({
                    acceptor     : $('#' + p),
                    defaultColor : css[p]
                }).render();
            } else {
                var el = $('#' + p);
                if (el.find('option').length) {
                    el.find('option[value=' + css[p] + ']').attr('selected', 'selected');
                } else {
                    el.val(css[p]);
                }
            }
        }
    });
}

// 绑定实时更新事件
function bindRealTimeEvents() {
    var modify = false,
        obj    = null;

    function updateEvent(event) {
        var self  = $(obj),
            value = self.val(),
            win   = $('#view').get(0).contentWindow;

        if (value != self.data('mask')) {
            parser.set(obj.id, value);
            win && win.updateCss(parser.formatCss(self.data('css-name'), obj.id, value));
                // 用于统一列表背景
            obj.id === 'neter-dock-start-button-expand-background'
                && win.updateCss(parser.formatCss('neter-dock-list-fix', 'neter-dock-list-fix-background', value));
        }
    }

    $('#left input').on('focus', function(event) {
        modify = true;
        obj    = this;

        $(this).data('mask', $(this).val());

        event.stopPropagation();
    });

    $('#left select').on('change', function(event) {
        var self  = $(this),
            value = self.val(),
            win   = $('#view').get(0).contentWindow;

        parser.set(this.id, value);
        win && win.updateCss(parser.formatCss(self.data('css-name'), this.id, value));
    });

    $('body').on('click', updateEvent);
}

function loadThemes() {
    if (loadedThemes) { return ; }
    
    loadedThemes = true;

    var items = [];

    for (var p in themes) {
        items.push({
            name : p,
            css  : themes[p]
        });
    }

    comBox = new Neter.ComBox({
        container   : $('#themesListContainer'),
        items       : items,
        changeEvent : function(comBox, options) {
            parser.load(options.name);

            (function() {
                if (!parser.status()) {
                    var arg = arguments;
                    setTimeout(function() { arg.callee(); }, 500);
                    return false;
                }
                
                $.each(cssBlock, function(index, css) {
                    css = parser.get(css);
                    
                     for (var p in css) {
                        var el = $('#' + p);

                        if (!el.length) { return ; }
                        
                        if (el.find('option').length) {
                            el.find('option[value=' + css[p] + ']').attr('selected', 'selected');
                        } else {
                            el.val(css[p]);

                            cp[p] && cp[p].setColor(css[p]);
                        }
                    }
                });

                $('#themesName').val(options.name);
                $('#fileName').val(options.css);

                // 更新右侧
                $('#view').get(0).contentWindow.loadThemes(options.css);
            })();
        }
    }).render();
}
