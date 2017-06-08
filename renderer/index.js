(function () {
    "use strict";
    var path = require('path');
    var fs = require('fs');
    var cheerio = require('cheerio');
    var global = require('./global');
    var htmlList = [];
    var viewChange = require('./view.change');
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

    function setEditHtml(contentElement, htmlValue) {
        return function (e) {

        };
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

    function htmlLoad(targetElement, dirName, fileName) {
        var readPromise = global.getHtmlFile(dirName, fileName);

        readPromise.then(htmlValue => {
            if(htmlValue) {

                var file = {
                    'fileName': fileName,
                    'dirName': dirName,
                    'html' : htmlValue,
                    '$' : cheerio.load(htmlValue, { decodeEntities: false })
                };
                var card = document.createElement('div');
                var content = document.createElement('div');
                var action = document.createElement('div');
                var title = document.createElement('div');
                var htmlContent = document.createElement('div');
                // var updateBtn = document.createElement('a'); 수정버튼 임시보류
                var saveBtn = document.createElement('a');

                card.classList.add('card');

                content.classList.add('card-content');
                title.classList.add('card-title');
                action.classList.add('card-action');

                htmlContent.classList.add('code-wrapper');
                htmlContent.classList.add('modal-content');

                title.textContent = file.path;


                htmlContent.setAttribute('data-code-index', htmlList.length);

                // updateBtn.className = 'tw-btn waves-effect indigo-d-3 white-text';
                // updateBtn.textContent = '수정';
                // updateBtn.setAttribute('data-target', 'updateModal');
                // updateBtn.addEventListener('click', setEditHtml(htmlContent, htmlValue));


                saveBtn.className = 'tw-btn waves-effect indigo-d-3 white-text';
                saveBtn.textContent = '저장';
                saveBtn.addEventListener('click', saveHtml(htmlContent));


                content.appendChild(htmlContent);
                action.appendChild(saveBtn);
                card.appendChild(title);
                card.appendChild(content);
                card.appendChild(action);
                targetElement.appendChild(card);

                var codeArea = CodeMirror(htmlContent, mirrorOption);
                codeArea.setValue(htmlValue);
                file.mirror = codeArea;
                htmlList.push(file);
                twCom.form.reload();
            }
        }).catch(function (err) {
           throw err;
        });
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




    function fileChange(targetElement) {
        return function (e) {
            if(e.srcElement.files.length > 0) {
                htmlList.length = 0;
                console.log('초기화');
                targetElement.innerHTML = '';
                var dirPath = e.srcElement.files[0].path || '';
                try{
                    var files = fs.readdirSync(dirPath);
                    files.forEach(file => {
                        htmlLoad(targetElement, dirPath, file);
                    });
                }catch(exception) {
                    console.log(exception)
                }
            }
        }
    }


    window.addEventListener('DOMContentLoaded', () => {
        console.log('renderer process DOMContentLoaded');

        let targetElement = document.querySelector('#file-contents');
        document.querySelector('#output-directory-input').addEventListener('change', require('./file.output')(htmlList));
        document.querySelector('#directory-file-input').addEventListener('change',fileChange(targetElement));
        document.querySelector('#menu-side-nav').addEventListener('click', function(e)  {
            if(e.target.classList.contains('menu')) viewChange.call(this,e.target);
        });
    });
})();
