    var fs = require('./lib/fs.promise');
    var path = require('path');


    var global = {};

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

    //상위 엘리먼트중에 인자로받은 className 엘리먼트가 있는지 찾기
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


    module.exports = global;