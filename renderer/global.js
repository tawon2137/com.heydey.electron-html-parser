var fs = require('./lib/fs.promise');
var path = require('path');


var configFilePath = path.join(__dirname, '../config/code.config.json');


var xlsx = require("node-xlsx");
var global = {};
var blockData = {};

var converterData = {};
var htmlList = [];


function excelDataToJson(dataMap, rowData, currentRow) {
    if(rowData.length === 0) return false;


    var currentData = dataMap[currentRow[0]][currentRow[1]];
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

global.createConfigFile = function () {
    if(!this.fileCheck(configFilePath)) {
        var config = {
            excelDir : path.join(__dirname, '../excel'),
            targetDir : path.join(__dirname, '../test-template'),
            outputDir : path.join(__dirname, '../output'),
            blockFilePath: path.join(__dirname, '../excel/block.xlsx'),
            converterFilePath : path.join(__dirname, '../excel/converter.xlsx'),
        };
        fs.writeFileSync(configFilePath , JSON.stringify(config));
    }
};

global.saveConfigData = function (config) {
    if(typeof config === 'object') {
        fs.writeFileSync(configFilePath , JSON.stringify(config));
    }
};


global.getConfigData = function () {
    if(global.fileCheck(configFilePath)) {
        var data;
        try {
            data = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
        }catch(e) {
            data = null;
        }finally {
            return data;
        }

    }else {
        return null;
    }
}

global.fileCheck = function (filePath) {
    return fs.existsSync(filePath);
};

global.isHtmlFile = function (fullPath) {
    return fs.statSync(fullPath).isFile() && path.extname(fullPath) === '.html';
}

global.getHtmlFile = function (dirName, fileName) {
    var fullPath = path.join(dirName, fileName);

    if(this.isHtmlFile(fullPath)) {
        return fs.readFileAsync(fullPath, 'utf-8');
    }else {
        return null;
    }
};

global.getRootElement = function(element, className) {
    while(element) {
        if(element.classList.contains(className)) {
            return element;
        }else {
            element = element.parentElement;
        }
    }
    return null;
};


global.readConverterData = function (path) {
    var configData = xlsx.parse(path)[0];
    configData = configData.data || [];
    var currentRow;
    for(var i = 0; i < configData.length; i++) {
        var row = configData[i];
        if(row[0] && row[1] && converterData[row[0]]) {
            converterData[row[0]][row[1]] = typeof converterData[row[0]][row[1]] === 'object' ? converterData[row[0]][row[1]] : {};
            currentRow = row;
        }else if(row[0] && row[1] || row[0] === 'global'){
            converterData[row[0]] = {};
            row[1] = !row[1] ? 'test': row[1];
            converterData[row[0]][row[1]] = {};
            currentRow = row;
        }
        excelDataToJson(converterData, row, currentRow);
    }
    return converterData;
};

global.readBlockData = function readBlockData(path) {
    var blockFile = xlsx.parse(path)[0];
    blockFile = blockFile.data || [];
    for(var i = 0; i < blockFile.length; i++) {
        var row = blockFile[i];
        if(row[0] && row[1]) {
            blockData[row[0]] = row[1];
        }
    }
    return blockData;
};

global.getHtmlList = function () {
    return htmlList;
};

global.setHtmlList = function (arr) {
    htmlList.length = 0;
    for(var i = 0; i < arr.length; i++) {
        htmlList[i] = arr[i];
    }
    htmlList = arr;
};


module.exports = global;