'use strict';

var fs = require('./lib/fs.promise');
var path = require('path');
var cheerio = require('cheerio');

var converterData = {};
var blockData = {};

var regExp = new RegExp('{{\\w*}}', 'g');
function getSubCodeInsertData(htmlData, subCodeData) {
    if(!regExp.test(htmlData)) return htmlData;
    var arr = [];
    var matches = htmlData.match(regExp);
    for(var i = 0, len = matches.length; i < len; i++) {
        if(subCodeData[matches[i]]) {
            htmlData = htmlData.replace(matches[i], subCodeData[matches[i]]);
        }else {
            htmlData = htmlData.replace(matches[i], '');
        }
    }
    return htmlData;
}


function getBlockHtml($blockContainer, containerChilds) {
    for(var key in containerChilds) {
        $blockContainer.append(getSubCodeInsertData(blockData[key], containerChilds[key]) + '\n');
    }
}

function getBlockContainerHtml($, configData) {
    for(var key in configData) {
        var $blockContainer = $(`*[${key}]`);
        if($blockContainer.length > 0) {
            getBlockHtml($blockContainer, configData[key]);
            $blockContainer.removeAttr(key);
        }
    }
    return $.html();
}


module.exports = function (data, conData, blockMap) {
    var fileName = data.fileName;
    var $ = cheerio.load(data.html, { decodeEntities: false });
    var htmlarr = [];
    var dataMap = {};

    //전역변수에 인자로 받은 엑셀데이터 치환
    converterData = conData || {};
    blockData = blockMap || {};

    //자신의 파일명의 키값이 존재하는지 확인 없을시에는 global의 데이터를 활용함
    if(converterData[fileName]) {
        var configData = converterData[fileName];
        for(var key in configData) {
            dataMap[key] = getBlockContainerHtml($, configData[key]);
            htmlarr.push(dataMap);
            dataMap = {};
            $ = cheerio.load(data.html, { decodeEntities: false });
        }
    }else if('html' in data && 'fileName' in data) {
        var configData = converterData['global'];
        configData[data.fileName] = configData['test'];
        for(var key in configData) {
            dataMap[key] = getBlockContainerHtml($, configData[key]);
            htmlarr.push(dataMap);
            dataMap = {};
            $ = cheerio.load(data.html, { decodeEntities: false });
        }
    }
    return htmlarr;
};
