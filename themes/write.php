<?php
// 保存css样式
ini_set('magic_quotes_gpc', 'off');

$css    = $_POST['css'];
$file   = $_POST['fileName'];
$themes = $_POST['themes'];

if (is_null($file)) {
    exit('文件名称不能为空！');
}

if (strpos($file, '.css') === false) {
    $file .= '.css';
}

// 打开文件
if ($handle = fopen($file, 'w')) {
    // 写入内容
    if (fwrite($handle, $css) === false) {
        exit('写入文件失败！');
    }

    fclose($handle);

    // 写配置信息
    if ($handle = fopen('manifest.json', 'w')) {
        if (fwrite($handle, $themes) === false) {
            exit('写入配置信息失败！');
        }
    } else {
        exit('打开配置文件失败！');
    }

    fclose($handle);

    exit("保存成功，文件名：{$file}。");
}

echo "打开文件{$file}失败！";