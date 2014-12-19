(function () {
    'use strict';

    var selectro = {},

        _clickfunc = "click",
        _altclick = "click",
        _configs = {
            links:false,
            searchable:true
        },
        objects = [],

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
            for(var config in configs){
                if(configs.hasOwnProperty(config) && _configs.hasOwnProperty(config)){
                    _configs[config] = configs[config];
                }
            }
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

        _toggleOptions = function(index){
            for(var i in objects){
                if(objects.hasOwnProperty(i)){
                    if(index === parseFloat(i)){
                        objects[i].new_options.style.display = (objects[i].new_options.style.display === "block")? "none" : "block" ;
                        objects[i].new_options.style.zIndex = (objects[i].new_options.style.display === "block")? "10000" : "auto" ;
                        objects[i].new_select.classList.toggle('selected');
                        objects[i].new_options.addEventListener('click', function(e){e.stopPropagation();});
                    }else if(objects[i].new_options.style.display === "block"){
                        objects[i].new_options.style.display = "none";
                        objects[i].new_options.style.zIndex = "auto";
                        objects[i].new_select.classList.toggle('selected');
                    }
                }
            }

            return false;
        },

        _hideOptions = function(){
            for(var i in objects){
                if(objects.hasOwnProperty(i) && objects[i].new_options.style.display === "block"){
                    objects[i].new_options.style.display = "none";
                    objects[i].new_options.style.zIndex = "auto";
                    objects[i].new_select.classList.toggle('selected');
                }
            }

            return false;
        },

        _setText = function(el, text, html){
            if(typeof html !== "undefined" && html === true)
                el.innerHTML = text;
            else if(document.all)
                el.innerText = text;
            else
                el.textContent = text;
        },

        _getText = function(el){
            return (document.all)? el.innerText : el.textContent;
        },

        _select = function(el, i){
            if(objects.hasOwnProperty(i)){
                objects[i].new_input.value = el.getAttribute("data-value");

                 _setText(objects[i].label, _getText(el));

                if(objects[i].label.classList.contains('default'))
                    objects[i].label.classList.remove('default');

                _toggleOptions(i);
            }

            return false;
        },

        _link = function(el){
            var link = el.getAttribute("data-value");

            if(typeof link !== "undefined"){
                window.location.assign(link);
            }

            return false;
        },

        _search = function(search){
            window.addEventListener('keyup', function(){
                if(typeof console !== "undefined")
                    console.log(search.value);
            });
        };

    selectro.init = function(configs){
        if(typeof configs !== "undefined" && typeof configs === "object"){
            _setConfigs(configs);
        }

        var selects = document.querySelectorAll(".selectro");

        if(_browser() === "mobile"){
            if(_configs.links){
                [].forEach.call(selects, function(el){
                    el.addEventListener("change", function(){window.location.assign(el.value);});
                });
            }
            return;
        }

        [].forEach.call(selects, function(obj){
            var _objs = {
                    new_input : _createEl('input'),
                    select_wrap : _createEl('div', {'class':'selectro-wrap', 'style':'position:relative;'}),
                    new_select : _createEl('div', {'style':'overflow:visible;position:relative;', 'class':'selectro'}),
                    search : _createEl('input', {'class':'selectro-search', 'type':'text'}),
                    label : _createEl('span', {'class':'selectro-label default'}),
                    arrow : _createEl('span', {'class':'selectro-arrow', 'style':'display:inline-block;position:relative;vertical-align:middle;border-color:rgb(140,140,140) transparent transparent transparent;border-width:7px 5px 0 5px;border-style:solid;width:0;height:0;'}),
                    new_options : _createEl('div', {'style':'position:absolute;display:none;', 'class':'selectro-options'})
                },
                object_count = objects.length,
                label = "Select an Option",
                select_children = obj.children,
                sibling = obj.nextElementSibling;

            _setAttributes(_objs.new_input, {'type':'hidden', 'name':obj.getAttribute("name"), 'value':''});

            [].forEach.call(select_children, function(el){
                var _create_obj = function(obj){
                    if(obj === select_children[0] && !el.hasAttribute('value')){
                        label = el.value;
                        return;
                    }

                    var new_a = _createEl('div', {'style': 'display:block;position:relative;', 'data-value': obj.value});

                    _setText(new_a, obj.firstChild.nodeValue);
                    _objs.new_options.appendChild(new_a);

                    if(_configs.links)
                        new_a.addEventListener("click", function(){_link(this);});
                    else
                        new_a.addEventListener("click", function(){_select(this, object_count);});

                    if(obj.hasAttribute('selected')){
                        _objs.new_input.value = obj.value;
                        new_a.classList.add('selected');
                        _setText(_objs.label, _getText(obj));
                        _objs.label.classList.remove('default');
                    }
                };

                if(el.tagName.toLowerCase() === "optgroup"){
                    if(typeof el.getAttribute("label") !== "undefined"){
                        var opt_header = document.createElement("h6");

                        _setText(opt_header, el.getAttribute("label"));
                        _objs.new_options.appendChild(opt_header);
                    }

                    [].forEach.call(el.children, function(child){
                        _create_obj(child);
                    });
                }else{
                    _create_obj(el);
                }
            });

            _setText(_objs.label, label);

            obj.parentNode.appendChild(_objs.new_input);

            if(typeof sibling !== "undefined")
                obj.parentNode.insertBefore(_objs.select_wrap, sibling);
            else
                obj.parentNode.appendChild(_objs.select_wrap);

            _objs.select_wrap.appendChild(_objs.new_select);
            _objs.select_wrap.appendChild(_objs.new_options);

            _objs.new_select.appendChild(_objs.label);
            _objs.new_select.appendChild(_objs.arrow);

            _objs.new_select.addEventListener('click', function(e){e.stopPropagation(); _toggleOptions(object_count);});
            _objs.search.addEventListener('focus', function(){_search(_objs.search);});
            document.addEventListener('click', function(){_hideOptions();});

            objects.push(_objs);

            obj.parentNode.removeChild(obj);
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();