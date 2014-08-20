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

        _calculateWidth = function(el, append_px){
            var styles = window.getComputedStyle(el, null),
                calculated_width = el.offsetWidth -
                parseFloat(styles.getPropertyValue('padding-left')) -
                parseFloat(styles.getPropertyValue('padding-right')) -
                (parseFloat(styles.getPropertyValue('border-left-width')) + parseFloat(styles.getPropertyValue('border-right-width')));

            if(typeof append_px === "boolean" && append_px === true)
                calculated_width += "px";

            return calculated_width;
        },

        _calculateHeight = function(el, append_px){
            var styles = window.getComputedStyle(el, null),
                calculated_height = el.offsetHeight -
                parseFloat(styles.getPropertyValue('padding-top')) -
                parseFloat(styles.getPropertyValue('padding-bottom')) -
                (parseFloat(styles.getPropertyValue('border-top-width')) + parseFloat(styles.getPropertyValue('border-bottom-width')));

            if(typeof append_px === "boolean" && append_px === true)
                calculated_height += "px";

            return calculated_height;
        },

        _toggleOptions = function(el){
            var options = el.parentNode.querySelector('.selectro-options'),
                display = options.style.display;

            options.style.display = (display === "block")? "none" : "block" ;
            el.classList.toggle('selected');
            options.addEventListener('click', function(e){e.stopPropagation();});

            return false;
        },

        _hideOptions = function(el){
            var options = el.parentNode.querySelector('.selectro-options');
            if(options.style.display === "block"){
                options.style.display = "none";
                el.classList.toggle('selected');
            }

            return false;
        },

        _search = function(search){
            window.addEventListener('keyup', function(){
                console.log(search.value);
            });
        };

    selectro.init = function(){
        var selects = document.querySelectorAll('select.selectro');

        _values = (typeof _values === "undefined")? [] : _values;

        [].forEach.call(selects, function(obj){
            var select_wrap = document.createElement('div'),
                new_select = document.createElement('div'),
                arrow = document.createElement('span'),
                serach_wrap = document.createElement('div'),
                glass = document.createElement('span'),
                search = document.createElement('input'),
                new_options = document.createElement('div');

            _setAttributes(new_select, {'style':'overflow:visible;position:relative;', 'class':'selectro'});
            _setAttributes(new_options, {'style':'position:relative;display:none;', 'class':'selectro-options'});
            _setAttributes(arrow, {'style':'display:inline-block;position:relative;vertical-align:middle;border-color:rgb(140,140,140) transparent transparent transparent;border-width:7px 5px 0 5px;border-style:solid;width:0;height:0;margin:0 0 0 8px;'});
            _setAttributes(search, {'type':'text', 'class':'selectro-search', 'style':'display:block;', 'name':'selectro-search'});

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

            obj.parentNode.appendChild(select_wrap);
            select_wrap.appendChild(new_select);
            new_select.appendChild(arrow);
            select_wrap.appendChild(new_options);

            new_select.style.width =  _calculateWidth(new_select, true);
            select_wrap.style.width = new_select.offsetWidth + "px";
            new_select.style.height = _calculateHeight(new_select, true);

            new_select.addEventListener('click', function(e){e.stopPropagation(); _toggleOptions(new_select);});
            search.addEventListener('focus', function(){_search(search);});
            document.addEventListener('click', function(){_hideOptions(new_select);});

            obj.style.display = "none";
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