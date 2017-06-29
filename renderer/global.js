var fs = require('./lib/fs.promise');
var path = require('path');


var configFilePath = path.join(__dirname, '../config/code.config.json');

var global = {};
var htmlList = [];


global.createConfigFile = function () {
    if(!this.fileCheck(configFilePath)) {
        var targetDir = path.join(__dirname, '../test-template');
        var config = this.returnPath(targetDir);
        config.outputDir = path.join(__dirname, '../output');
        this.saveConfigData(config);
    }
};

global.returnPath = function (dirPath) {
    var targetDir = dirPath || __dirname;
    return {
      targetDir : targetDir,
      blockFilePath : path.join(targetDir, 'code.block.json'),
      converterFilePath : path.join(targetDir, 'code.converter.json'),
    }
}

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

global.getHtmlFilePromise = function (dirName, fileName) {
    var fullPath = path.join(dirName, fileName);

    if(this.isHtmlFile(fullPath)) {
        return fs.readFileAsync(fullPath, 'utf-8');
    }else {
        return null;
    }
};
global.getHtmlFile = function (dirName, fileName) {
    var fullPath = path.join(dirName, fileName);
    try{
      if(this.isHtmlFile(fullPath)) {
          return fs.readFileSync(fullPath, 'utf-8');
      }else {
          return '';
      }
    }catch(exception) {
      return '';
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


global.getHtmlList = function () {
    return htmlList;
};

global.setHtmlList = function (arr) {
    htmlList.length = 0;
    for(var i = 0; i < arr.length; i++) {
        htmlList[i] = arr[i];
    }
};


global.jsonFileRead = function (filePath) {
    if(path.extname(filePath) !== '.json') {
        twCom.fn.toast(`파일의 확장자가 json 포맷이 아닙니다.`, 3000);
        return {};
    }

    if (!this.fileCheck(filePath)) {
        fs.writeFileSync(filePath, '');
    }

    try {
        var data = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(data);
    }catch(exception) {
        data = {};
        twCom.fn.toast(`${filePath}의 데이터가 JSON 양식이 아닙니다.`, 3000);
    }
    return data;
};

module.exports = global;
