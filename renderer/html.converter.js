'use strict';

var fs = require('./lib/fs.promise');
var path = require('path');
var cheerio = require('cheerio');
var global = require('./global');
var blockData = {};

var regExp = new RegExp('{{\\w*}}', 'gi');
var includeExp = new RegExp('{{_include@(.*)(\\.html)}}', 'gi');

function repeatHtml(htmlData, num, propArr) {
    var htmlRepeatData = '';
    var imsiString = '';
    var reg = new RegExp(`(${Object.keys(propArr).join('|')})`,'i');
    var indexReg = new RegExp('{{_index}}','gim');
    for(var i = 0; i < num; i++) {
      imsiString = htmlData;
        if(reg.test(htmlData)) {
          imsiString = htmlData;
            for(var key in propArr) {
              imsiString = imsiString.replace(new RegExp(key, 'gim'), propArr[key][i] || '');
            }
        }
      htmlRepeatData += imsiString.replace(indexReg, i);
    }
    return htmlRepeatData + "@repeat";
}


function getSubCodeInsertData(htmlData, subCodeData, codeRemove, repeatNum) {
    var subCodeNames = getSubCodeKey(Object.keys(subCodeData || {}));
    if( !converterCodeCheck(htmlData) && subCodeData.length > 0 ) return htmlData;
    var subCodes = {};

    for(var i = 0; i < subCodeNames.length; i++) {
        subCodes[subCodeNames[i]] = subCodeData[subCodeNames[i]]
    }

    var matches = htmlData.match(regExp);
    var arrProp = {};
    var subCodesValue = '';
    var matcheExp;
    matches = matches === null ? [] : matches;
    for(var i = 0, len = matches.length; i < len; i++){
        if( subCodes[matches[i]] && repeatNum > 0 && Array.isArray(subCodes[matches[i]]) ) {
          arrProp[matches[i]] = subCodes[matches[i]];
          continue;
        }else if(subCodes[matches[i]]){
            subCodesValue = subCodes[matches[i]];
            if(regExp.test(subCodes[matches[i]])) {
                subCodesValue = getSubCodeInsertData(subCodesValue, subCodeData._global, true);
            }
            htmlData = htmlData.replace(matches[i], subCodesValue);
        }else {
            htmlData = codeRemove ? htmlData : htmlData.replace(matches[i], '');
        }
    }

    if(repeatNum) {
      htmlData = repeatHtml(htmlData,Number(repeatNum), arrProp);
    }

    return htmlData;
}
function twoDimensionalCheck(array) {
  var bool = true;
      for(var i = 0; i < array.length; i++) {
        if(Array.isArray(array[i])) {
          continue;
        }else {
          bool = false;
          break;
        }
      }
      return bool;
}

function blockConverter($blockContainer, childs) {
    var blockName, insertHtml, referHtml, childContainer, repeat, htmlsplit, $, arr;
   for(var i = 0; i < childs.length; i++) {
       blockName = childs[i].blockName;
       if(blockData[blockName]) {
           insertHtml = getSubCodeInsertData(blockData[blockName], childs[i], false, childs[i].repeat);
           htmlsplit = insertHtml.split('@');
           insertHtml = insertHtml.replace('@repeat', '');
           $ = cheerio.load(`${insertHtml}`, { decodeEntities: false });
           referHtml = $('body');
           if(Array.isArray(childs[i].children)) {
               repeat = htmlsplit[htmlsplit.length - 1] === 'repeat' ? true : false;
               if(repeat && twoDimensionalCheck(childs[i].children)){
                arr = childs[i].children;
                for(var j = 0, len = arr.length; j < len; j++) {
                  blockConverter(referHtml.children().eq(j), childs[i].children[j]);
                }
              }else {
                childContainer = repeat ? referHtml.children() : referHtml.children().last();
                blockConverter(childContainer, childs[i].children);
              }
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




function converterCodeCheck(htmlData, argExp) {
    argExp = argExp ? argExp : regExp;
    var matches = htmlData.match(argExp);

    return matches !== null
}
function getSubCodeKey(conKeys) {
    return conKeys.filter(key => key.match(regExp) !== null);
}
function htmlConvert($, convert) {
    for(var key in convert) {
        if(key === 'out' || regExp.test(key)) continue;

        var $blockContainer = $(`*[${key}]`);
        if($blockContainer.length > 0) {
            containerConverter($blockContainer, convert[key]);
            $blockContainer.removeAttr(key);
        }

    }
    return $.html();
}

function includeHtml(htmlData, dirPath) {
  var includes = htmlData.match(includeExp);
  var filePath, fileData, giReg;

  for(var i = 0; i < includes.length; i++) {
    giReg = new RegExp(includes[i], 'gi');
    filePath = includes[i].split('@')[1].replace('}}', '').trim();
    fileData = global.getHtmlFile(dirPath, filePath);
    htmlData = htmlData.replace(giReg, fileData);
  }
  return htmlData;
}

function setSubCodePrototype(refObj, targetObj) {
    if(typeof targetObj !== 'object') {
        return false;
    }else if(!Array.isArray(targetObj)){
        targetObj._global = refObj;
    }

    var keys = Object.keys(targetObj);
    for(var i = 0; i < keys.length; i++) {
        if(keys[i] !== "_global" && targetObj.hasOwnProperty(keys[i]) && typeof targetObj[keys[i]] === "object") {
            setSubCodePrototype(refObj, targetObj[keys[i]]);
        }
    }
}
function chainGlobalSubCodes(subCodeObj) {
    var subCodeKeys = getSubCodeKey(Object.keys(subCodeObj));
    if(subCodeKeys.length === 0 ) return false;
    var object = {};
    for(var i = 0; i < subCodeKeys.length; i++) {
        object[subCodeKeys[i]] = subCodeObj[subCodeKeys[i]];
        delete subCodeObj[subCodeKeys[i]];
    }

    setSubCodePrototype(object, subCodeObj);

}

module.exports = function (data, conData, blockMap, templatePath) {
    var fileName = data.fileName;
    var htmlList = [];
    var dataMap = null;
    var outPrefix = 'z_';
    var fileNameCheck = data.fileName.substr(0, 2);
    // for(var i = 0; i < conData.length; i++) {
    //     if(conData[i].fileName === fileName) {
    //         dataMap = conData[i];
    //         break;
    //     }
    // }
    if(fileName === conData.fileName) {
        dataMap = conData;
    }

    if(dataMap === null && fileNameCheck.trim() !== outPrefix) {
       let html = converterCodeCheck(data.html, includeExp) ? includeHtml(data.html, templatePath) : data.html;
       let notConverterFileData = {};
       notConverterFileData[outPrefix + data.fileName] = html;
       return [notConverterFileData];
    }else if(dataMap === null) {
       return [];
    }


    blockData = blockMap;
    var html = getSubCodeInsertData(data.html, dataMap, true);
    html = converterCodeCheck(html, includeExp) ? includeHtml(html, templatePath) : html;
    var templateArr = dataMap.outFiles;

    var $,fileName, htmlReturnValue;
    for(var i = 0; i < templateArr.length; i++) {
        fileName = templateArr[i].out;
        $ = cheerio.load(html,  { decodeEntities: false });
        htmlReturnValue = {};
        chainGlobalSubCodes(templateArr[i]);
        htmlReturnValue[outPrefix + fileName] = htmlConvert($, templateArr[i]);
        htmlList.push(htmlReturnValue);
    }
    return htmlList;
};
