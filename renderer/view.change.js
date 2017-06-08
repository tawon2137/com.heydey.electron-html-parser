    function settingView(command, mainElement) {
        if(command === 'code-block') {
            require('./code.block')(mainElement);
        }else if (command === 'code-config') {
            require('./code.config')(mainElement);
        }
    }


    function viewChange(btnElement) {
        var menus = this.querySelectorAll('.menu');
        var mainElement = null;
        for(var i = 0, len = menus.length; i < len; i++ ) {
            if(menus[i].isEqualNode(btnElement)) {
                !menus[i].classList.contains('active') ? menus[i].classList.add('active') : '';
                mainElement = document.querySelector(`#${menus[i].getAttribute('data-main-target')}`);
                if(mainElement) {
                    mainElement.style.display = '';
                    settingView(`${menus[i].getAttribute('data-main-target')}`, mainElement);
                }
            }else {
                menus[i].classList.remove('active');
                mainElement = document.querySelector(`#${menus[i].getAttribute('data-main-target')}`);
                if(mainElement) mainElement.style.display = 'none';
            }
        }
    }

    module.exports = viewChange;
