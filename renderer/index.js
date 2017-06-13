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
        outputTrigger.addEventListener('click', require('./file.output')(global.getHtmlList()));
        document.querySelector('#menu-side-nav').addEventListener('click', function(e)  {
            if(e.target.classList.contains('menu')) viewChange.call(this,e.target);
        });
    });
})();
