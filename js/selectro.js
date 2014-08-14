(function () {
    'use strict';
    var selectro = {},

        _setAttributes = function(el, attrs){
            for(var attr in attrs){
                el.setAttribute(attr, attrs[attr]);
            }

            return false;
        },

        _toggleOptions = function(el){
            var options = el.querySelector('.selectro-options'),
                display = options.style.display;

            options.style.display = (display === "block")? "none" : "block" ;
            el.classList.toggle('selected');
            options.addEventListener('click', function(e){e.stopPropagation();});

            return false;
        },

        _hideOptions = function(el){
            var options = el.querySelector('.selectro-options');
            if(options.style.display === "block") options.style.display = "none";

            return false;
        };

    selectro.init = function(){
        var selects = document.querySelectorAll('select.selectro');

        [].forEach.call(selects, function(obj){
            var new_select = document.createElement('div'),
                new_options = document.createElement('div');

            _setAttributes(new_select, {'style':'overflow:visible;position:relative;', 'class':'selectro'});
            _setAttributes(new_options, {'style':'position:absolute;display:none;', 'class':'selectro-options'});

            [].forEach.call(obj.querySelectorAll('option'), function(el){
                if(el === obj.firstElementChild){
                    new_select.innerText = el.firstChild.nodeValue;
                }else {
                    var new_a = document.createElement('div'),
                        attrs = {'style': 'display:block;position:relative;', 'data-value': el.value};

                    _setAttributes(new_a, attrs);

                    new_a.innerText = el.firstChild.nodeValue;
                    new_options.appendChild(new_a);
                }
            });

            document.body.appendChild(new_select);
            new_select.appendChild(new_options);

            new_select.style.width = new_select.offsetWidth - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-left')) - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-right')) -  (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))*2) + "px";
            new_select.style.height = new_select.offsetHeight - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-top')) - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-bottom')) -  (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))*2) + "px";
            new_options.style.width = parseFloat(new_select.style.width) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-left')) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-right')) +  (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))*2) - (parseFloat(window.getComputedStyle(new_options, null).getPropertyValue('border-width'))*2) + "px";
            new_options.style.top = parseFloat(new_select.style.height) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-top')) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-bottom')) + (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))) + "px";

            new_select.addEventListener('click', function(e){e.stopPropagation(); _toggleOptions(this);});
            document.addEventListener('click', function(){_hideOptions(new_select);});
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();

if(document.readyState === "complete"){
    selectro.init();
}else{
    if(document.addEventListener){
        try{
            document.addEventListener("DOMContentLoaded", selectro.init, false);
        }catch(e){
            window.addEventListener("load", selectro.init, false);
        }
    }else if(document.attachEvent){
        try{
            document.attachEvent("onreadystatechange", selectro.init);
        }catch(e){
            window.attachEvent("onload", selectro.init);
        }
    }
}