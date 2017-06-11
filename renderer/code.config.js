    var path = require('path');
    var fs = require('fs');
    var cheerio = require('cheerio');
    var global = require('./global');
    var configfilePath = path.join(__dirname, '../code.config/code-config.json');
    var blockfilePath = path.join(__dirname, '../code.config/code-block.json');



    function removeSubCode(e) {
        var trigger = e.target;

        var card = global.getRootElement(trigger, 'card');
        var key = card.getAttribute('data-code-id');
        var data = fs.readFileSync(configfilePath, 'utf-8');
        data = data ? JSON.parse(data) : {};

        if(data[key]) {
            delete data[key];
            card.parentElement.removeChild(card);
            fs.writeFileSync(configfilePath, JSON.stringify(data));
            twCom.fn.toast(`(${key})치환코드를 삭제했습니다.`, 2000);
        }
    }

    function createCodeElementList(codeObj) {
        "use strict";
        var arr = [];
        var card, action, nameInput, removeBtn;

        for(var key in codeObj) {
            card = document.createElement('div');
            card.setAttribute('data-code-id', key);
            card.className = 'card col s12';

            action = document.createElement('div');
            action.className = 'card-action col s12';
            action.style.position = 'relative';
            nameInput = document.createElement('div');
            nameInput.className = 'tw-input-field col s11';
            nameInput.innerHTML =
                `<input type="text" name="code-name" data-code-id="${key}" readonly value="${codeObj[key]}" >
                 <label class="input-field-label">치환코드 : ${key}</label>
                 <hr class="focusline">`;

            removeBtn = document.createElement('a');
            removeBtn.className = 'tw-btn-clear col s1';
            removeBtn.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`
            removeBtn.addEventListener('click', removeSubCode);

            action.appendChild(nameInput);
            action.appendChild(removeBtn);
            card.appendChild(action);
            arr.push(card);
        }
        return arr;
    }


    function createSubCode(e) {
        var trigger = e.target;

        var parentCard = global.getRootElement(trigger, 'card');
        var subName,subCode;
        try {
            subName = parentCard.querySelector('form input[name="name"]').value;
            subCode = parentCard.querySelector('form input[name="code"]').value;
        }catch(exception) {

        } finally {
            if(!subName || !subCode) {
                twCom.fn.toast('치환코드명과 코드내용이 제대로기입되지 않았습니다!', 4000);
                return false;
            }
        }
        var fileData = fs.readFileSync(configfilePath, 'utf-8');
        fileData = fileData ? JSON.parse(fileData) : {};
        if(!fileData[subName]) {
            fileData[subName] = subCode;
        }else {
            twCom.fn.toast('치환코드명이 중복됩니다.', 4000);
            return false;
        }

        try {
            fs.writeFileSync(configfilePath, JSON.stringify(fileData));
        } catch(exception) {
            console.log('Error ',exception);
            twCom.fn.toast('파일처리 도중 오류가 발생했습니다.(콘솔확인)', 4000);
            return false;
        } finally {
            readSubCode(document.querySelector('#code-config'));
        }
    }

    function readSubCode(mainElement) {
        console.log(global.fileCheck(configfilePath));
        if(!global.fileCheck(configfilePath)) {
            fs.writeFileSync(configfilePath);
        }

        document.querySelector('#create-code').addEventListener('click', createSubCode);

        var fileData = fs.readFileSync(configfilePath, 'utf-8');
        var cardElementList;
        try {
            cardElementList = createCodeElementList(JSON.parse(fileData));
        } catch (exception) {
            cardElementList = {};
        }

        var container = mainElement.querySelector('div.row.container');
        container.innerHTML = '';
        container.style.display = 'none';
        for(var i = 0, len = cardElementList.length; i < len; i++) {
            container.appendChild(cardElementList[i]);
        }
        container.style.display = '';
        twCom.form.reload();
        
    }
    module.exports = readSubCode;