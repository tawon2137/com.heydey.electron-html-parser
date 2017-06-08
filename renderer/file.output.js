var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var global = require('./global');
var configfilePath = path.join(__dirname, '../code.config/code-config.json');
var blockfilePath = path.join(__dirname, '../code.config/code-block.json');


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
        console.log(htmlList);
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
            promises.push(new Promise((fullfield, reject) => {
                "use strict";
                fs.writeFile(path.join(outputPath, htmlList[key].fileName), htmlData, (err) => {
                   if(err) reject(err)
                   else fullfield();
                });
            }));
        }

        Promise.all(promises)
            .then(() => twCom.fn.toast('파일작성이 완료되었습니다.', 4000))
            .catch(error => twCom.fn.toast('파일작성이 실패하였습니다.', 4000));
    }
};


