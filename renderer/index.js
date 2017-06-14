(function () {
    "use strict";
    var path = require('path');
    var fs = require('./lib/fs.promise');
    var global = require('./global');

    var viewChange = require('./view.change');
    var htmlView = require('./html.view');

    window.addEventListener('DOMContentLoaded', () => {
        global.createConfigFile();

        let targetElement = document.querySelector('#html-list');
        htmlView(targetElement);
        let outputTrigger = document.querySelector('#output-directory-btn');
        let blockAddForm = document.querySelector('.addForm');
        blockAddForm.addEventListener('click', function (e) {
            var element = e.target || e.srcElement;
            var id = element.getAttribute('id');

            if(id === 'block-form-hide') {
                this.querySelector('.card').style.display = 'none';
                this.querySelector('#block-form-show').style.display = 'inline-block';
            }else if(id === 'block-form-show') {
                this.querySelector('.card').style.display = 'block';
                this.querySelector('#block-form-show').style.display = 'none';
            }

        });
        outputTrigger.addEventListener('click', require('./file.output')(global.getHtmlList()));
        document.querySelector('#menu-side-nav').addEventListener('click', function(e)  {
            if(e.target.classList.contains('menu')) viewChange.call(this,e.target);
        });
    });
})();
