'use strict';

var fs = require('./lib/fs.promise');
var path = require('path');
var cheerio = require('cheerio');

var converterData = {};
var blockData = {};

var regExp = new RegExp('{{\\w*}}', 'gi');

function getSubCodeInsertData(htmlData, subCodeData) {

    var subCodeNames = getSubCodeKey(Object.keys(subCodeData));
    if( !converterCodeCheck(htmlData) && subCodeData.length > 0 ) return htmlData;
    var subCodes = {};

    for(var i = 0; i < subCodeNames.length; i++) {
        subCodes[subCodeNames[i]] = subCodeData[subCodeNames[i]]
    }

    var matches = htmlData.match(regExp);
    matches = matches === null ? [] : matches;
    for(var i = 0, len = matches.length; i < len; i++) {
        if(subCodes[matches[i]]) {
            htmlData = htmlData.replace(matches[i], subCodes[matches[i]]);
        }else {
            htmlData = htmlData.replace(matches[i], '');
        }
    }
    return htmlData;
}


function blockConverter($blockContainer, childs) {
    var blockName, insertHtml, referHtml;
   for(var i = 0; i < childs.length; i++) {
       blockName = childs[i].blockName;
       if(blockData[blockName]) {
           insertHtml = getSubCodeInsertData(blockData[blockName], childs[i]);

           referHtml = cheerio.load(`${insertHtml}`, { decodeEntities: false })('body');
           if(Array.isArray(childs[i].children)) {
               blockConverter(referHtml.children().last(), childs[i].children);
           }
           childs[i].selector ? $blockContainer.find(childs[i].selector).append(referHtml.html()) : $blockContainer.append(referHtml.html());
       }
   }
}

function containerConverter($blockContainer, containerChilds) {
    $blockContainer.html(getSubCodeInsertData($blockContainer.html(), containerChilds));
    for(var key in containerChilds) {
        if(key === 'children') {
            blockConverter($blockContainer, containerChilds[key]);
        }
    }
}


function converterCodeCheck(htmlData) {
    var matches = htmlData.match(regExp);

    return matches !== null
}
function getSubCodeKey(conKeys) {
    return conKeys.filter(key => key.match(regExp) !== null);
}
function htmlConvert($, convert) {
    for(var key in convert) {
        if(key === 'out') continue;

        var $blockContainer = $(`*[${key}]`);
        if($blockContainer.length > 0) {
            containerConverter($blockContainer, convert[key]);
            $blockContainer.removeAttr(key);
        }

    }
    return $.html();
}

module.exports = function (data, conData, blockMap) {
    var fileName = data.fileName;
    var htmlList = [];
    var dataMap = null;
    // for(var i = 0; i < conData.length; i++) {
    //     if(conData[i].fileName === fileName) {
    //         dataMap = conData[i];
    //         break;
    //     }
    // }
    if(fileName === conData.fileName) {
        dataMap = conData;
    }
    if(dataMap === null) {
        return data.html;
    }

    blockData = blockMap;
    var html = getSubCodeInsertData(data.html, dataMap);
    var templateArr = dataMap.outFiles;
    var $,fileName, htmlReturnValue;
    for(var i = 0; i < templateArr.length; i++) {
        fileName = templateArr[i].out;
        $ = cheerio.load(html,  { decodeEntities: false });
        htmlReturnValue = {};
        htmlReturnValue[fileName] = htmlConvert($, templateArr[i]);
        htmlList.push(htmlReturnValue);
    }
    return htmlList;
};










/*
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
 */