    var fs = require('fs');
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
            return new Promise(function (fullfiild, reject) {
                fs.readFile(fullPath, 'utf-8', function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    fullfiild(data);
                });
            });
        }else {
            return null;
        }
    };

    //부모엘리먼트 카드엘리먼트 찾기
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