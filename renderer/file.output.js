var path = require('path');
var fs = require('./lib/fs.promise');
var cheerio = require('cheerio');
var global = require('./global');
var configfilePath = path.join(__dirname, '../code.config/code-config.json');
var blockfilePath = path.join(__dirname, '../code.config/code-block.json');

function setTing(object, rowData, key , index) {

    var currentData = object[key][index];
    if(!currentData[rowData[2]]) {
        currentData[rowData[2]] = {};
    }

    if(!currentData[rowData[2]][rowData[3]]) {
        currentData[rowData[2]][rowData[3]] = {};
    }

    for(var i = 4; i < rowData.length; i++) {
        console.log();
        currentData[rowData[2]][rowData[3]][rowData[i]] = rowData[i+1] || '';
        i++;
    }
}


var xlsx = require("node-xlsx");

var excelData = xlsx.parse(path.join(__dirname, '../excel/test.xlsx'))[0];
var excelConfig = excelData.data || [];
console.log(excelConfig);
var obj = {}, fileName = '', index = 0;
for(var i = 0; i < excelConfig.length; i++) {
    var row = excelConfig[i];
    if(row[0] && row[1] && fileName === row[0]) {
        obj[row[0]].push({
            outPath: row[1]
        });
        index += 1;
    }else if(row[0] && row[1]){
        obj[row[0]] = [];
        obj[row[0]].push({
            outPath: row[i]
        });
        fileName = row[0];
        index = 0;
    }

    setTing(obj, row, fileName, index);
}



var regExp = new RegExp('{{\\w*}}', 'g');
function getBlockInsertData($, blockData) {
    "use strict";

    for(var prop in blockData) {
        $(`*[${prop}]`).append(blockData[prop]);
        $(`*[${prop}]`).removeAttr(`${prop}`);
    }
    return $.html();
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

    if(arr.length > 0) {
        twCom.fn.toast(`${matches.join(',')} 치환코드가 메모리상에 등록되있지않습니다.`, 5000);
    }

    return htmlData;
}


module.exports = function (htmlList) {
    return function (e) {
        var blockData = fs.readFileSync(blockfilePath,'utf-8');
        var subCodeData = fs.readFileSync(configfilePath, 'utf-8');
        subCodeData = subCodeData ? JSON.parse(subCodeData) : {};
        blockData = blockData ? JSON.parse(blockData) : {};

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
            var htmlData = getBlockInsertData(htmlList[key].$, blockData);
            htmlData = getSubCodeInsertData(htmlData, subCodeData);
            promises.push(fs.writeFileAsync(path.join(outputPath, htmlList[key].fileName), htmlData));
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




