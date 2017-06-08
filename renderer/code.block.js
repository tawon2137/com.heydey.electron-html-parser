    "use strict";
    var path = require('path');
    var fs = require('fs');
    var cheerio = require('cheerio');
    var blockfilePath = path.join(__dirname, '../code.config/code-block.json');
    var global = require('./global');
    var addblock;





    function readCodeblock(mainElement) {

        document.querySelector('#create-block').addEventListener('click', codeBlockAdd);
        var mirrorOption = {
            lineNumbers: true,
            mode: 'htmlmixed'
        };

        if (!addblock) {
            addblock = CodeMirror(document.querySelector('#block-code'), mirrorOption);
        }else {
            addblock.getWrapperElement().parentElement.removeChild(addblock.getWrapperElement());
            addblock = CodeMirror(document.querySelector('#block-code'), mirrorOption);
        }

        //파일있는지없는지 여부체크
        if (!global.fileCheck(blockfilePath)) {
            fs.writeFileSync(blockfilePath, '');
        }


        var blockData = fs.readFileSync(blockfilePath, 'utf-8');
        var blockList;
        try {
            blockList = getBlockElementList(JSON.parse(blockData));
        } catch (exception) {
            blockList = {};
        }

        var container = mainElement.querySelector('div.row.container');
        container.innerHTML = '';
        container.style.display = 'none';
        for(var i = 0, len = blockList.length; i < len; i++) {
            container.appendChild(blockList[i].card);
        }
        container.style.display = '';
        for(var i = 0, len = blockList.length; i < len; i++) {
            CodeMirror(blockList[i].codemirror, mirrorOption).setValue(blockList[i].codeValue);
        }

        twCom.form.reload();
    }


    function removeBlock(e) {
        var trigger = e.target;

        var card = global.getRootElement(trigger, 'card');
        var key = card.getAttribute('data-block-id');
        var data = fs.readFileSync(blockfilePath, 'utf-8');
        data = data ? JSON.parse(data) : {};

        if(data[key]) {
            delete data[key];
            card.parentElement.removeChild(card);
            fs.writeFileSync(blockfilePath, JSON.stringify(data));
            twCom.fn.toast(`(${key})블록코드를 삭제했습니다.`, 2000);
        }
    }

    function getBlockElementList(blockData) {
        var arr = [];
        var card, action, nameInput, codemirror, removeBtn;

        for(var key in blockData) {
            card = document.createElement('div');
            card.setAttribute('data-block-id', key);
            card.className = 'card col s12';

            action = document.createElement('div');
            action.className = 'card-action col s12';
            action.style.position = 'relative';

            nameInput = document.createElement('div');
            nameInput.className = 'tw-input-field col s11';
            nameInput.innerHTML =
                `<input type="text" name="block-name" readonly value="${key}" >
                 <label class="input-field-label">블록명</label>
                 <hr class="focusline">`;

            codemirror = document.createElement('div');
            codemirror.className = 'code-wrapper col s12';

            removeBtn = document.createElement('a');
            removeBtn.className = 'tw-btn-clear col s1';
            removeBtn.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`
            removeBtn.addEventListener('click', removeBlock);

            action.appendChild(nameInput);
            action.appendChild(removeBtn);
            action.appendChild(codemirror);
            card.appendChild(action);
            arr.push({ 'card': card, 'codemirror': codemirror, 'codeValue' : blockData[key] || '' });
        }
        return arr;
    }

    function codeBlockAdd(e) {
        var fileData = null;
        var parentElement = global.getRootElement(e.target, 'card');
        if(!fs.existsSync(blockfilePath) || !parentElement) {
            twCom.fn.toast('추가할 설정파일이 존재하지않거나 루트 엘리먼트 검색에 실패했습니다.', 5000);
            return false;
        }

        try {
            var fileData = fs.readFileSync(blockfilePath, 'utf-8');
            fileData = fileData ? JSON.parse(fileData) : {};
            var name = parentElement.querySelector(`form input[name="name"]`).value;
            var htmlValue = addblock.getValue();
            if(!name || !htmlValue) {
                twCom.fn.toast('name, code 프로퍼티는 필수 입력값입니다.', 5000);
                return false;
            }
            if(!fileData[name]) {
                fileData[name] = htmlValue;
            }else {
                twCom.fn.toast('블록내에서 name의 값이 중복됩니다. 확인 후 다시시도해주세요', 5000);
                return false;
            }

            fs.writeFileSync(blockfilePath, JSON.stringify(fileData));
            twCom.fn.toast('블록이 추가되었습니다.', 5000);

        }catch(expection) {
            console.error('Error Console : ', expection);
            twCom.fn.toast('파일처리도중 에러가 발생하였습니다. 콘솔을 확인해주세요.', 5000);
        }finally {
            parentElement ? parentElement.querySelector('form').reset() : '';
            readCodeblock(document.querySelector('#code-block'));
        }
    }


    module.exports = readCodeblock;