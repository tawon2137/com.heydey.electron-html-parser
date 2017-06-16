    var path = require('path');
    var fs = require('fs');
    var cheerio = require('cheerio');
    var global = require('./global');
    
    function configSave(form, prevConfig) {
        return function (e) {
            var config = Object.assign({}, prevConfig);
            try {
                config.targetDir = form.querySelector('input[name="template-directory"]').value;
                config.outputDir = form.querySelector('input[name="output-directory"]').value;
                config.converterFilePath = form.querySelector('input[name="converter-path"]').value;
                config.blockFilePath = form.querySelector('input[name="block-path"]').value;
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
        form.querySelector('input[name="converter-path"]').setAttribute('value', config.converterFilePath || '');
        form.querySelector('input[name="block-path"]').setAttribute('value', config.blockFilePath || '');


        form.querySelector('#config-form-output-directory').onchange = pathChange;
        form.querySelector('#config-form-target-directory').onchange = pathChange;
        form.querySelector('#config-form-converter-path').onchange = pathChange;
        form.querySelector('#config-form-block-path').onchange = pathChange;

        form.querySelector('#config-form-save').onclick =  configSave(form, config);
    }

    module.exports = readSubCode;



    // var configfilePath = path.join(__dirname, '../code.config/code-config.json');
    //
    //
    //
    //
    // function removeSubCode(e) {
    //     var trigger = e.target;
    //
    //     var card = global.getRootElement(trigger, 'card');
    //     var key = card.getAttribute('data-code-id');
    //     var data = fs.readFileSync(configfilePath, 'utf-8');
    //     data = data ? JSON.parse(data) : {};
    //
    //     if(data[key]) {
    //         delete data[key];
    //         card.parentElement.removeChild(card);
    //         fs.writeFileSync(configfilePath, JSON.stringify(data));
    //         twCom.fn.toast(`(${key})치환코드를 삭제했습니다.`, 2000);
    //     }
    // }
    //
    // function createCodeElementList(codeObj) {
    //     "use strict";
    //     var arr = [];
    //     var card, action, nameInput, removeBtn;
    //
    //     for(var key in codeObj) {
    //         card = document.createElement('div');
    //         card.setAttribute('data-code-id', key);
    //         card.className = 'card col s12';
    //
    //         action = document.createElement('div');
    //         action.className = 'card-action col s12';
    //         action.style.position = 'relative';
    //         nameInput = document.createElement('div');
    //         nameInput.className = 'tw-input-field col s11';
    //         nameInput.innerHTML =
    //             `<input type="text" name="code-name" data-code-id="${key}" readonly value="${codeObj[key]}" >
    //              <label class="input-field-label">치환코드 : ${key}</label>
    //              <hr class="focusline">`;
    //
    //         removeBtn = document.createElement('a');
    //         removeBtn.className = 'tw-btn-clear col s1';
    //         removeBtn.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`
    //         removeBtn.addEventListener('click', removeSubCode);
    //
    //         action.appendChild(nameInput);
    //         action.appendChild(removeBtn);
    //         card.appendChild(action);
    //         arr.push(card);
    //     }
    //     return arr;
    // }
    //
    //
    // function createSubCode(e) {
    //     var trigger = e.target;
    //
    //     var parentCard = global.getRootElement(trigger, 'card');
    //     var subName,subCode;
    //     try {
    //         subName = parentCard.querySelector('form input[name="name"]').value;
    //         subCode = parentCard.querySelector('form input[name="code"]').value;
    //     }catch(exception) {
    //
    //     } finally {
    //         if(!subName || !subCode) {
    //             twCom.fn.toast('치환코드명과 코드내용이 제대로기입되지 않았습니다!', 4000);
    //             return false;
    //         }
    //     }
    //     var fileData = fs.readFileSync(configfilePath, 'utf-8');
    //     fileData = fileData ? JSON.parse(fileData) : {};
    //     if(!fileData[subName]) {
    //         fileData[subName] = subCode;
    //     }else {
    //         twCom.fn.toast('치환코드명이 중복됩니다.', 4000);
    //         return false;
    //     }
    //
    //     try {
    //         fs.writeFileSync(configfilePath, JSON.stringify(fileData));
    //     } catch(exception) {
    //         console.log('Error ',exception);
    //         twCom.fn.toast('파일처리 도중 오류가 발생했습니다.(콘솔확인)', 4000);
    //         return false;
    //     } finally {
    //         readSubCode(document.querySelector('#code-config'));
    //     }
    // }
