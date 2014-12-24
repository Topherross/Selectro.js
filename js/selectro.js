(function () {
    'use strict';

    var selectro = {},

        _clickfunc = "click",
        _altclick = "click",
        _configs = {
            links:false,
            searchable:true,
            searchIcon:true,
            beforeInit:false,
            afterInit:false,
            beforeSelect:false,
            afterSelect:false
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
                if(objects.hasOwnProperty(i) && typeof objects[i].options_wrap !== "undefined"){
                    if(index === parseFloat(i)){
                        objects[i].options_wrap.style.display = (objects[i].options_wrap.style.display === "block")? "none" : "block" ;
                        objects[i].options_wrap.style.zIndex = (objects[i].options_wrap.style.display === "block")? "10000" : "auto" ;
                        objects[i].new_select.classList.toggle('selected');
                        objects[i].options_wrap.addEventListener('click', function(e){e.stopPropagation();});

                        if(objects[i].options_wrap.style.display === "block"){
                            objects[i].search.value = "";
                            objects[i].search.focus();
                        }

                    }else if(objects[i].options_wrap.style.display === "block"){
                        objects[i].options_wrap.style.display = "none";
                        objects[i].options_wrap.style.zIndex = "auto";
                        objects[i].new_select.classList.toggle('selected');
                    }
                }
            }

            return false;
        },

        _hideOptions = function(){
            for(var i in objects){
                if(objects.hasOwnProperty(i) &&
                    typeof objects[i].options_wrap !== "undefined" &&
                    objects[i].options_wrap.style.display === "block"){
                    objects[i].options_wrap.style.display = "none";
                    objects[i].options_wrap.style.zIndex = "auto";
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
                if(typeof _configs.beforeSelect === "function")
                    _configs.beforeSelect(objects[i], el);

                objects[i].original_input.value = el.getAttribute("data-value");

                 _setText(objects[i].label, _getText(el));

                if(objects[i].label.classList.contains('default'))
                    objects[i].label.classList.remove('default');

                _toggleOptions(i);

                if(typeof _configs.afterSelect === "function")
                    _configs.afterSelect(objects[i], el);
            }

            return false;
        },

        _selectTile = function(el, i){
            if(el.hasAttribute("data-disabled") && el.getAttribute("data-disabled") === "disabled")
                return false;

            if(objects.hasOwnProperty(i)){
                if(typeof _configs.beforeSelect === "function")
                    _configs.beforeSelect(objects[i], el);

                objects[i].original_input.value = el.getAttribute("data-value");console.log(objects[i].original_input.value);

                for(var tile in objects[i].tiles){
                    if(objects[i].tiles.hasOwnProperty(tile) && objects[i].tiles[tile].classList.contains('selected')){
                        objects[i].tiles[tile].classList.remove('selected');
                    }
                }

                el.classList.add('selected');

                if(typeof _configs.afterSelect === "function")
                    _configs.afterSelect(objects[i], el);
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

        _search = function(el, i){
            if(typeof i === "undefined")
                return;

            var matches = false;

            for(var option in objects[i].options){
                if(objects[i].options.hasOwnProperty(option)){
                    var el_text = _getText(objects[i].options[option]).toLowerCase();
                    if(el_text.indexOf(el.value.toLowerCase()) === -1){
                        if(matches === false)
                            matches = true;
                        objects[i].options[option].style.display = "none";
                    }else{
                        objects[i].options[option].style.display = "block";
                    }
                }
            }

            if(typeof console !== "undefined")
                console.log(el.value, i);
        },

        _buildMobile = function(objs){
            [].forEach.call(objs, function(el){
                el.addEventListener("change", function(){
                    if(_configs.links)
                        window.location.assign(el.value);
                    else if(typeof _configs.afterSelect === "function")
                        _configs.afterSelect(el);
                });
            });

            if(typeof _configs.afterInit === "function")
                _configs.afterInit(objects);
        },

        _buildLists = function(objs){
            [].forEach.call(objs, function(obj, index){
                var _objs = {
                        original_input : obj,
                        select_wrap : _createEl('div', {'class':'selectro-wrap', 'style':'position:relative;'}),
                        new_select : _createEl('div', {'style':'overflow:visible;position:relative;', 'class':obj.classList, 'id':(obj.hasAttribute('id'))? 'selectro_'+obj.getAttribute('id') : 'selectro_'+index}),
                        label : _createEl('span', {'class':'selectro-label default'}),
                        arrow : _createEl('span', {'class':'selectro-arrow', 'style':'display:inline-block;position:relative;vertical-align:middle;border-color:rgb(140,140,140) transparent transparent transparent;border-width:7px 5px 0 5px;border-style:solid;width:0;height:0;'}),
                        options_wrap : _createEl('div', {'style':'position:absolute;display:none;', 'class':'selectro-options-wrap'}),
                        new_options : _createEl('div', {'class':'selectro-options'}),
                        options : []
                    },
                    object_count = objects.length,
                    label = "Select an Option",
                    select_children = obj.children,
                    sibling = obj.nextElementSibling;

                if(_configs.searchable === true) {
                    _objs.search_wrap = _createEl('div', {'class':'selectro-search-wrap', 'style':'overflow:auto;'});
                    _objs.search = _createEl('input', {'class':'selectro-search', 'type':'text'});
                    _objs.options_wrap.appendChild(_objs.search_wrap);

                    if (_configs.searchIcon === true) {
                        _objs.search_icon = _createEl('div', {'class':'selectro-search-icon', 'style':'float:right;'});
                        _objs.search_wrap.appendChild(_objs.search_icon);
                    }

                    _objs.search_wrap.appendChild(_objs.search);

                    _objs.search.addEventListener('keyup', function(){
                        _search(this, object_count);
                    }, false);
                    _objs.search.addEventListener('paste', function(){
                        // @TODO: Timeout used until clipboardData is accessible in a consistent cross-browser environment. 12-24-2014
                        setTimeout(function(){
                            _search(_objs.search, object_count);
                        }, 20);
                    }, false);
                }

                [].forEach.call(select_children, function(el){
                    var _create_obj = function(obj){
                        if(obj === select_children[0] && !el.hasAttribute('value')){
                            label = el.value;
                            _objs.original_input.value = "";
                            return;
                        }

                        var new_option = _createEl('div', {'class':'selectro-option', 'style': 'display:block;position:relative;', 'data-value': obj.value});

                        _setText(new_option, obj.firstChild.nodeValue);
                        _objs.new_options.appendChild(new_option);

                        if(_configs.links)
                            new_option.addEventListener("click", function(){_link(this);});
                        else
                            new_option.addEventListener("click", function(){_select(this, object_count);});

                        if(obj.hasAttribute('selected')){
                            new_option.classList.add('selected');
                            _setText(_objs.label, _getText(obj));
                            _objs.label.classList.remove('default');
                        }

                        _objs.options.push(new_option);
                    };

                    if(el.tagName.toLowerCase() === "optgroup"){
                        if(typeof el.getAttribute("label") !== "undefined"){
                            var opt_header = _createEl("h6", {'class':'selectro-optgroup-header'});

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

                if(typeof sibling !== "undefined")
                    obj.parentNode.insertBefore(_objs.select_wrap, sibling);
                else
                    obj.parentNode.appendChild(_objs.select_wrap);

                _objs.select_wrap.appendChild(_objs.new_select);
                _objs.select_wrap.appendChild(_objs.options_wrap);
                _objs.options_wrap.appendChild(_objs.new_options);

                _objs.new_select.appendChild(_objs.label);
                _objs.new_select.appendChild(_objs.arrow);

                _objs.new_select.addEventListener('click', function(e){
                    e.stopPropagation();
                    _toggleOptions(object_count);
                });
                _objs.search.addEventListener('focus', function(){
                    _search(_objs.search);
                });
                document.addEventListener('click', function(){
                    _hideOptions();
                });

                objects.push(_objs);

                obj.style.display = "none";
            });
        },

        _buildGrids = function(objs){
            [].forEach.call(objs, function(obj, index){
                var _objs = {
                        original_input : obj,
                        grid_wrap : _createEl('div', {'class':'selectro-grid-wrap', 'style':'position:relative;'}),
                        grid : _createEl('div', {'class':'selectro-grid'}),
                        tiles : []
                    },
                    object_count = objects.length,
                    label = "Select an Option",
                    select_children = obj.children,
                    sibling = obj.nextElementSibling;

                [].forEach.call(select_children, function(el){
                    var _create_obj = function(obj){
                        if(obj === select_children[0] && !el.hasAttribute('value')){
                            label = el.value;
                            _objs.original_input.value = "";
                            return;
                        }

                        var new_option = _createEl('div', {'class':'selectro-grid-option', 'style': 'display:block;position:relative;', 'data-value': obj.value}),
                            tile = _createEl('div', {'class':'selectro-tile'}),
                            tile_inner = _createEl('div', {'class':'selectro-tile-inner'}),
                            tile_label = _createEl('div', {'class':'selectro-grid-option-label'});

                        _setText(tile_label, obj.firstChild.nodeValue);
                        _objs.grid.appendChild(new_option);
                        new_option.appendChild(tile_label);
                        new_option.appendChild(tile);
                        tile.appendChild(tile_inner);

                        new_option.addEventListener("click", function(){
                            _selectTile(this, object_count);
                        });

                        if(obj.hasAttribute('selected') && !obj.hasAttribute('disabled')){
                            new_option.classList.add('selected');
                        }else if(obj.hasAttribute('disabled')){
                            _setAttributes(new_option, {'data-disabled':'disabled'});
                            new_option.classList.add('disabled');
                        }

                        _objs.tiles.push(new_option);
                    };

                    if(el.tagName.toLowerCase() === "optgroup"){
                        if(typeof el.getAttribute("label") !== "undefined"){
                            var opt_header = _createEl("h6", {'class':'selectro-grid-optgroup-header'});

                            _objs.grid.appendChild(opt_header);
                        }

                        [].forEach.call(el.children, function(child){
                            _create_obj(child);
                        });
                    }else{
                        _create_obj(el);
                    }
                });

                if(typeof sibling !== "undefined")
                    obj.parentNode.insertBefore(_objs.grid_wrap, sibling);
                else
                    obj.parentNode.appendChild(_objs.grid_wrap);

                _objs.grid_wrap.appendChild(_objs.grid);

                objects.push(_objs);

                obj.style.display = "none";
            });
        };

    selectro.init = function(configs){
        if(typeof configs !== "undefined" && typeof configs === "object"){
            _setConfigs(configs);
        }

        if(typeof _configs.beforeInit === "function")
            _configs.beforeInit();

        var selects = document.querySelectorAll(".selectro"),
            grids = document.querySelectorAll(".selectro-grid");

        if(_browser() === "mobile"){
            _buildMobile(selects);

            return;
        }

        _buildLists(selects);
        _buildGrids(grids);

        if(typeof _configs.afterInit === "function")
            _configs.afterInit(objects);
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();