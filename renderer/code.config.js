    var path = require('path');
    var fs = require('fs');
    var cheerio = require('cheerio');
    var global = require('./global');

    function configSave(form, prevConfig) {
        return function (e) {
            try {
                var config = global.returnPath(form.querySelector('input[name="template-directory"]').value);
                config.outputDir = form.querySelector('input[name="output-directory"]').value;
                global.saveConfigData(config);
                twCom.fn.toast('성공적으로 저장되었습니다.', 4000);
            }catch(e) {
                global.saveConfigData(prevConfig);
                twCom.fn.toast('파일처리중 오류가 발생했습니다.', 4000);
            }
        }
    }
    function pathChange(e) {
        var element = e.tartget || e.srcElement;
        var filePath = '';
        var fileInput = element.nextElementSibling;

        try {
            filePath = element.files[0].path;
        }catch(e) {
            filePath = '';
        }
        if(element.getAttribute('directory') === null && filePath) {
            var ext = path.extname(filePath);
            ext === '.json' ? fileInput.setAttribute('value', filePath) : twCom.fn.toast('파일확장자가 잘못되었습니다.', 4000);
        }else if(filePath) {
            fileInput.setAttribute('value', filePath);
        }
    }

    function readSubCode(mainElement) {
        var config = global.getConfigData();


        var container = mainElement.querySelector('div.row.container');
        var form = container.querySelector('#code-config-form');

        form.querySelector('input[name="template-directory"]').setAttribute('value', config.targetDir || '');
        form.querySelector('input[name="output-directory"]').setAttribute('value', config.outputDir || '');

        form.querySelector('#config-form-output-directory').onchange = pathChange;
        form.querySelector('#config-form-target-directory').onchange = pathChange;

        form.querySelector('#config-form-save').onclick =  configSave(form, config);
    }

    module.exports = readSubCode;
