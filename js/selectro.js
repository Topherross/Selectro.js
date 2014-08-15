(function () {
    'use strict';
    var selectro = {},

        _values = "undefined",

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
            if(options.style.display === "block"){
                options.style.display = "none";
                el.classList.toggle('selected');
            }

            return false;
        };

    selectro.init = function(){
        var selects = document.querySelectorAll('select.selectro');

        [].forEach.call(selects, function(obj){
            var new_select = document.createElement('div'),
                arrow = document.createElement('span'),
                serach_wrap = document.createElement('div'),
                glass = document.createElement('span'),
                search = document.createElement('input'),
                new_options = document.createElement('div');

            _values = (typeof _values === "undefined")? [] : _values;

            _setAttributes(new_select, {'style':'overflow:visible;position:relative;', 'class':'selectro'});
            _setAttributes(new_options, {'style':'position:absolute;display:none;', 'class':'selectro-options'});
            _setAttributes(arrow, {'style':'display:inline-block;position:relative;vertical-align:middle;border-color:rgb(140,140,140) transparent transparent transparent;border-width:7px 5px 0 5px;border-style:solid;width:0;height:0;margin:0 0 0 8px;'});
            _setAttributes(search, {'type':'text', 'class':'selectro-search', 'style':'display:block;border:rgb(96,96,96) 1px solid;'});

            new_options.appendChild(search);

            [].forEach.call(obj.querySelectorAll('option'), function(el){
                if(el === obj.firstElementChild){
                    new_select.innerText = el.firstChild.nodeValue;
                }else {
                    var new_a = document.createElement('div'),
                        attributes = {'style': 'display:block;position:relative;', 'data-value': el.value};

                    _setAttributes(new_a, attributes);

                    if(typeof _values === "array" && _values.indexOf(el.value) === -1)  _values.push(el.value);

                    new_a.innerText = el.firstChild.nodeValue;
                    new_options.appendChild(new_a);
                }
            });

            document.body.appendChild(new_select);
            new_select.appendChild(arrow);
            new_select.appendChild(new_options);

            new_select.style.width = new_select.offsetWidth - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-left')) - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-right')) -  (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))*2) + "px";
            new_select.style.height = new_select.offsetHeight - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-top')) - parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-bottom')) -  (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))*2) + "px";
            new_options.style.width = parseFloat(new_select.style.width) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-left')) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-right')) +  (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))*2) - (parseFloat(window.getComputedStyle(new_options, null).getPropertyValue('border-width'))*2) + "px";
            new_options.style.top = parseFloat(new_select.style.height) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-top')) + parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('padding-bottom')) + (parseFloat(window.getComputedStyle(new_select, null).getPropertyValue('border-width'))) + "px";

            new_select.addEventListener('click', function(e){e.stopPropagation(); _toggleOptions(this);});
            document.addEventListener('click', function(){_hideOptions(new_select);});
        });
    };

    selectro.getParent = function(){
        return _parent;
    };

    selectro.getValue = function(){
        return _replacement.value;
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