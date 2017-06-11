"use strict";

var path = require('path');
var fs = require('./lib/fs.promise');
var cheerio = require('cheerio');
var global = require('./global');
// var configfilePath = path.join(__dirname, '../code.config/code-config.json');
var blockfilePath = path.join(__dirname, '../code.config/code-block.json');

function excelDataToJson(object, rowData, currentRow) {

    var currentData = object[currentRow[0]][currentRow[1]];
    if(!currentData[rowData[2]]) {
        currentData[rowData[2]] = {};
    }

    if(!currentData[rowData[2]][rowData[3]]) {
        currentData[rowData[2]][rowData[3]] = {};
    }

    for(var i = 4; i < rowData.length; i++) {
        currentData[rowData[2]][rowData[3]][rowData[i]] = rowData[i+1] || '';
        i++;
    }
}


var xlsx = require("node-xlsx");
var excelData = xlsx.parse(path.join(__dirname, '../excel/test.xlsx'))[0];
var excelConfig = excelData.data || [];

var blockData = fs.readFileSync(blockfilePath,'utf-8');
blockData = blockData ? JSON.parse(blockData) : {};

var obj = {}, currentRow;
for(var i = 0; i < excelConfig.length; i++) {
    var row = excelConfig[i];
    if(row[0] && row[1] && obj[row[0]]) {
        obj[row[0]][row[1]]  =  typeof obj[row[0]][row[1]] === 'object' ? obj[row[0]][row[1]] : {};
        currentRow = row;
    }else if(row[0] && row[1]){
        obj[row[0]] = {};
        obj[row[0]][row[1]] = {}
        currentRow = row;
    }
    excelDataToJson(obj, row, currentRow);
}




var regExp = new RegExp('{{\\w*}}', 'g');


function getBlockHtml($blockContainer, containerChilds) {
    for(var key in containerChilds) {
        $blockContainer.append(getSubCodeInsertData(blockData[key], containerChilds[key]));
    }
}


function getblockContainerHtml($,blockConfig) {
    for(var key in blockConfig) {
        var $blockContainer = $(key);
        if($blockContainer.length > 0) {
            getBlockHtml($blockContainer, blockConfig[key]);
        }
    }
    return $.html();
}





function getTotalHtmltData(htmlData) {
    var fileName = htmlData.fileName;
    var $ = htmlData.$;
    var htmlarr = [];
    var object = {};
    if(obj[fileName]) {
        var configData = obj[fileName];
        for(var key in configData) {
            object[key] = getblockContainerHtml($,configData[key]);
            htmlarr.push(object);
            object = {};
        }
    }
    return htmlarr;
}

function getSubCodeInsertData(htmlData, subCodeData) {
    if(!regExp.test(htmlData)) return htmlData;
    var arr = [];
    var matches = htmlData.match(regExp);
    for(var i = 0, len = matches.length; i < len; i++) {
        if(subCodeData[matches[i]]) {
            htmlData = htmlData.replace(matches[i], subCodeData[matches[i]]);
        }else {
            arr.push(matches[i]);
        }
    }

    // if(arr.length > 0) {
    //     twCom.fn.toast(`${matches.join(',')} 치환코드가 메모리상에 등록되있지않습니다.`, 5000);
    // }

    return htmlData;
}

module.exports = function (htmlList) {
    return function (e) {

        try {
            var outputPath = e.target.files[0].path;
            var currentReadPath = document.querySelector('#directory-file-input').files[0].path;
        }catch(exception) {
            twCom.fn.toast(`선택된 파일경로가 없습니다.${exception.message ? exception.message : ''}`, 4000);
            return false;
        }


        if(outputPath === currentReadPath) {
            twCom.fn.toast('파일출력경로와 읽어오는 경로가 같을 수 없습니다.', 4000);
            return false;
        }


        var promises = [];
        for(var key in htmlList) {
            var htmlData = getTotalHtmltData(htmlList[key]);
            for(var i = 0; i < htmlData.length; i++) {
                var fileName = Object.keys(htmlData[i])[0];
                console.log(htmlData[i]);
                promises.push(fs.writeFileAsync(path.join(outputPath, fileName), htmlData[i][fileName]));
            }
        }

        if(promises.length > 0) {
            Promise.all(promises)
                .then(() => twCom.fn.toast('파일작성이 완료되었습니다.', 4000))
                .catch(error => twCom.fn.toast(`파일작성이 실패하였습니다.${error.message || ''}`, 4000));
        }else {
            twCom.fn.toast('작성할 파일이 존재하지않습니다.', 4000);
        }
    }
};




