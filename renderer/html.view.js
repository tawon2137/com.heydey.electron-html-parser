"use strict";
var path = require('path');
var fs = require('./lib/fs.promise');
var global = require('./global');


var mirrorOption = {
    lineNumbers: true,
    mode: 'htmlmixed',
    readOnly: true
};


function getMirror(htmlObject) {
    if(typeof htmlObject === 'object' ){
        return htmlObject.mirror || null;
    }
}

function saveHtml(contentElement) {
    var index = contentElement.getAttribute('data-code-index');
    return function (e) {
        var data = htmlList[index];
        var codeValue = getMirror(data);
        var fullPath = path.join(data.dirName, data.fileName);
        if(typeof codeValue === 'object') {
            try {
                global.isHtmlFile(fullPath) ? fs.writeFileSync(fullPath, codeValue.getValue()) : '';
                twCom.fn.toast(`저장경로 : ${fullPath}(성공)`, 4000);
            }catch (expection) {
                twCom.fn.toast(`파일저장 실패 ${expection.message ? expection.message : ''}`, 4000);
            }
        }
    };
}

function htmlLoad(dirName, fileName) {
    var readPromise = global.getHtmlFilePromise(dirName, fileName);
    return readPromise;
}

function viewHtmlFile(targetElement, dirName){
    var fileNames = fs.readdirSync(dirName);
    return function (arr) {
        var htmlList = [];
        arr.forEach((htmlValue, index) => {
            if(htmlValue) {
                var file = {
                    'fileName': fileNames[index],
                    'dirName': dirName,
                    'html' : htmlValue,
                };

                var card = document.createElement('div');
                card.className = 'card col s12';
                var content = document.createElement('div');
                content.className = 'card-content row';
                content.innerHTML = `파일명 : ${fileNames[index]}<br>디렉토리 : ${dirName}`;
                // var action = document.createElement('div');
                // var title = document.createElement('div');
                // var htmlContent = document.createElement('div');
                // // var updateBtn = document.createElement('a'); 수정버튼 임시보류
                // var saveBtn = document.createElement('a');
                //
                // card.classList.add('card');
                //
                // content.classList.add('card-content');
                // title.classList.add('card-title');
                // action.classList.add('card-action');
                //
                // htmlContent.classList.add('code-wrapper');
                // htmlContent.classList.add('modal-content');
                //
                // title.textContent = file.path;
                //
                //
                // htmlContent.setAttribute('data-code-index', htmlList.length);
                //
                // // updateBtn.className = 'tw-btn waves-effect indigo-d-3 white-text';
                // // updateBtn.textContent = '수정';
                // // updateBtn.setAttribute('data-target', 'updateModal');
                // // updateBtn.addEventListener('click', setEditHtml(htmlContent, htmlValue));
                //
                //
                // saveBtn.className = 'tw-btn waves-effect indigo-d-3 white-text';
                // saveBtn.textContent = '저장';
                // saveBtn.addEventListener('click', saveHtml(htmlContent));
                //
                //
                // content.appendChild(htmlContent);
                // action.appendChild(saveBtn);
                // card.appendChild(title);
                card.appendChild(content);
                // card.appendChild(action);
                targetElement.appendChild(card);

                // var codeArea = CodeMirror(htmlContent, mirrorOption);
                // codeArea.setValue(htmlValue);
                // file.mirror = codeArea;

                htmlList.push(file);
            }
        });
        global.setHtmlList(htmlList);
        htmlList = null;
    }
}

var Modaloption =  {
    onClose : false, // Modal창 밖을 클릭하면 Modal close이벤트 실행여부 default : true
    startY : 200, // translateY 애니메이션 시작위치 단위 : % default 150%
    endY : 100, // translateY 애니메이션 끝 위치 단위 : % default : 60%
    openCallback : function () { // Modal open Event Callback Function

    },
    closeCallback : function () { // Modal close Event Callback Function

    }
};


module.exports = function fileChange(targetElement) {
    if(targetElement) {
        var listContainer = targetElement.querySelector('.row.container');
        var config = global.getConfigData();
        var htmlDir = config.targetDir;
        if(listContainer) { listContainer.innerHTML = ''; }
        if(!fs.existsSync(htmlDir)) {
            twCom.fn.toast('HTML 파일디렉토리가 존재하지않습니다.',3000);
            return;
        }
        fs.readdirAsync(htmlDir)
                .then(result => {
                    var arr = [];
                    result.forEach(file => arr.push(htmlLoad(htmlDir, file)));
                    return Promise.all(arr);
                })
                .then(viewHtmlFile(listContainer, htmlDir))
                .catch(error => {
                    console.log(error);
                })
    }
};
