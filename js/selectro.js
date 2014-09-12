(function () {
    'use strict';
    var selectro = {},

        _values = "undefined",
        _clickfunc = "undefined",
        _altclick = "undefined",

        _browser = function(){
            var user_agent = navigator.userAgent,
                browser = "undefined";

            if(user_agent.match(/iPhone|iPod|iPad|Android|Blackberry|Opera Mini|Opera Mobi/i)) {
                _clickfunc = 'touchstart';
                _altclick = 'touchend';
                browser = 'mobile';
            }else if(user_agent.indexOf("Chrome") > -1) {
                browser = "chrome";
            } else if (user_agent.indexOf("Safari") > -1) {
                browser = "safari";
            } else if (user_agent.indexOf("Opera") > -1) {
                browser = "opera";
            } else if (user_agent.indexOf("Firefox") > -1) {
                browser = "firefox";
            } else if (user_agent.indexOf("MSIE") > -1) {
                browser = "msie";
            }

            return browser;
        },

        _setConfigs = function(configs){

        },

        _createEl = function(type, attrs){
            var el = document.createElement(type);
            if(typeof attrs !== "undefined")
                _setAttributes(el, attrs);

            return el;
        },

        _setAttributes = function(el, attrs){
            for(var attr in attrs){
                if(attrs.hasOwnProperty(attr))
                    el.setAttribute(attr, attrs[attr]);
            }

            return false;
        },

        _toggleOptions = function(el){
            var wrapper = el.parentNode,
                options = wrapper.querySelector('.selectro-options');

            options.style.display = (options.style.display === "block")? "none" : "block" ;
            wrapper.style.zIndex = (wrapper.style.zIndex === "auto")? "10000" : "auto" ;
            el.classList.toggle('selected');
            options.addEventListener('click', function(e){e.stopPropagation();});

            return false;
        },

        _hideOptions = function(el){
            var options = el.parentNode.querySelector('.selectro-options');

            if(options.style.display === "block"){
                options.style.display = "none";
                el.parentNode.style.zIndex = "auto";
                el.classList.toggle('selected');
            }

            return false;
        },

        _setText = function(el, text){
            if(document.all)
                el.innerText = text;
            else
                el.textContent = text;
        },

        _getText = function(el){
            return (document.all)? el.innerText : el.textContent;
        },

        _select = function(new_input, el){
            new_input.value = el.getAttribute("data-value");
            _setText(el.parentNode.parentNode.querySelector(".selectro-label"), _getText(el));
            _hideOptions(el.parentNode.parentNode.querySelector(".selectro"));
        },

        _link = function(el){
            var link = el.getAttribute("data-value");

            if(typeof link !== "undefined"){
                window.location.assign(link);
            }
        },

        _search = function(search){
            window.addEventListener('keyup', function(){
                console.log(search.value);
            });
        },

        _configs = {
            label:"Select an Option",
            links:false
        };

    selectro.init = function(configs){
        var __configs = (typeof configs !== "undefined" && typeof configs === "object")? configs : _configs,
            _objs = {
                new_input : _createEl('input'),
                select_wrap : _createEl('div', {'class':'selectro-wrap', 'style':'display:inline-block;position:relative;'}),
                new_select : _createEl('div', {'style':'overflow:visible;position:relative;', 'class':'selectro'}),
                search : _createEl('input', {'class':'selectro-search', 'type':'text'}),
                label : _createEl('span', {'class':'selectro-label'}),
                arrow : _createEl('span', {'class':'selectro-arrow', 'style':'display:inline-block;position:relative;vertical-align:middle;border-color:rgb(140,140,140) transparent transparent transparent;border-width:7px 5px 0 5px;border-style:solid;width:0;height:0;'}),
                new_options : _createEl('div', {'style':'position:absolute;display:none;', 'class':'selectro-options'})
            },
            selects = document.querySelectorAll(".selectro");

        if(_browser() === "mobile"){
            if(__configs.links){
                [].forEach.call(selects, function(el){
                    el.addEventListener("change", function(){window.location.assign(el.value);});
                });
            }
            return;
        }

        _values = (typeof _values === "undefined")? [] : _values;

        [].forEach.call(selects, function(obj){
            var select_children = obj.children;

            _setAttributes(_objs.new_input, {'type':'hidden', 'name':obj.getAttribute("name"), 'value':''});

            _setText(_objs.label, __configs.label);

            [].forEach.call(select_children, function(el){
                var _create_obj = function(obj){
                    var new_a = _createEl('div', {'style': 'display:block;position:relative;', 'data-value': obj.value});

                    if(typeof _values === "array" && _values.indexOf(obj.value) === -1)  _values.push(obj.value);

                    _setText(new_a, obj.firstChild.nodeValue);
                    _objs.new_options.appendChild(new_a);

                    if(__configs.links){
                        new_a.addEventListener("click", function(){_link(this);});
                    }else{
                        new_a.addEventListener("click", function(){_select(_objs.new_input, this);});
                    }
                };

                if(el.tagName.toLowerCase() === "optgroup"){
                    if(typeof el.getAttribute("label") !== "undefined"){
                        var opt_header = document.createElement("h6");

                        _setText(opt_header, el.getAttribute("label"));
                        _objs.new_options.appendChild(opt_header);
                    }

                    [].forEach.call(el.children, function(el){
                        _create_obj(el);
                    });
                }else{
                    _create_obj(el);
                }
            });

            obj.parentNode.appendChild(_objs.new_input);
            obj.parentNode.appendChild(_objs.select_wrap);
            _objs.select_wrap.appendChild(_objs.new_select);
            _objs.new_select.appendChild(_objs.label);
            _objs.new_select.appendChild(_objs.arrow);
            _objs.select_wrap.appendChild(_objs.new_options);console.log(_objs.select_wrap.width);

            _objs.new_select.addEventListener('click', function(e){e.stopPropagation(); _toggleOptions(_objs.new_select);});
            _objs.search.addEventListener('focus', function(){_search(_objs.search);});
            document.addEventListener('click', function(){_hideOptions(_objs.new_select);});

            obj.parentNode.removeChild(obj);
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();