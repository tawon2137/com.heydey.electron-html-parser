"use strict";

var path = require('path');
var fs = require('./lib/fs.promise');
var global = require('./global');
var converterHtml = require('./html.converter');


module.exports = function (htmlList) {

    return function (e) {
        var configData = global.getConfigData();
        var converterData = global.jsonFileRead(`${configData.converterFilePath}`);
        var blockData = global.jsonFileRead(`${configData.blockFilePath}`);

        var outputPath = configData.outputDir;
        var currentReadPath = configData.targetDir;


        if(outputPath === currentReadPath) {
            twCom.fn.toast('파일출력경로와 읽어오는 경로가 같을 수 없습니다.', 4000);
            return false;
        }

        var promises = [];
        for(var key in htmlList) {
            var htmlData = converterHtml(htmlList[key], converterData, blockData);
            for(var i = 0; i < htmlData.length; i++) {
                var fileName = Object.keys(htmlData[i])[0];
                if(path.extname(fileName) === '.html') {
                    promises.push(fs.writeFileAsync(path.join(outputPath, fileName), htmlData[i][fileName]));
                }
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
