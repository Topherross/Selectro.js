(function () {
    'use strict';

    var selectro = {},

        _clickfunc = "click",
        _altclick = "click",
        _configs = {
            links:false,
            beforeInit:false,
            afterInit:false,
            afterSelect:false
        },
        objects = [],

        _browser = function(){
            var browser = {
                    name : "default"
                },
                user_agent = navigator.userAgent;

            if(user_agent.match(/iPhone|iPod|iPad|Android|Blackberry|Opera Mini|Opera Mobi/i)) {
                _clickfunc = 'touchstart';
                _altclick = 'touchend';
                browser.name = 'mobile';
            } else if (user_agent.indexOf("MSIE") > -1) {
                var match = user_agent.match(/(?:msie |rv:)(\d+(\.\d+)?)/i);
                browser.name = "msie";
                browser.version = (match && match.length > 1 && match[1]) || '';
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

        _setText = function(el, text, html){
            if(typeof html !== "undefined" && html === true)
                el.innerHTML = text;
            else if(document.all)
                el.innerText = text;
            else
                el.textContent = text;

            return false;
        },

        _getText = function(el){
            return (document.all)? el.innerText : el.textContent;
        },

        _resetSearch = function(i){
            for(var option in objects[i].options){
                if(objects[i].options.hasOwnProperty(option))
                    objects[i].options[option].style.display = "block";
            }
            objects[i].highlighted = 0;

            return false;
        },

        _search = function(el, i){
            if(typeof i === "undefined")
                return;

            var matches = false;

            objects[i].matches = [];

            for(var option in objects[i].options){
                if(objects[i].options.hasOwnProperty(option)){
                    var el_text = _getText(objects[i].options[option]).toLowerCase();
                    if(el_text.indexOf(el.value.toLowerCase()) === -1){
                        objects[i].options[option].style.display = "none";
                    }else{
                        if(matches === false)
                            matches = true;
                        objects[i].options[option].style.display = "block";
                        objects[i].matches.push(parseInt(option));
                    }
                }
            }

            if(!matches){
                _setText(objects[i].no_match, 'No options were found matching your search');
                objects[i].new_options.appendChild(objects[i].no_match);
            }else if(matches && objects[i].no_match.parentNode !== null){
                objects[i].new_options.removeChild(objects[i].no_match);
            }console.log(objects[i].matches);

            return false;
        },

        _batchRemoveClass = function(objs, klass){
            for(var i in objs){
                if(objs.hasOwnProperty(i) && objs[i].classList.contains(klass))
                    objs[i].classList.remove(klass);
            }

            return false;
        },

        _highlightOption = function(obj_i, key){
            var highlighted = (objects[obj_i].highlighted === -1)? objects[obj_i].matches[0] : objects[obj_i].highlighted,
                new_i;

            if(typeof key !== "undefined") {
                if (key == 38)
                    new_i = (highlighted == objects[obj_i].matches[0]) ? objects[obj_i].matches[0] : objects[obj_i].matches[objects[obj_i].highlighted - 1];
                if (key == 40)
                    new_i = ((highlighted + 1) > (objects[obj_i].matches.length - 1)) ? objects[obj_i].matches[objects[obj_i].matches.length - 1] : objects[obj_i].matches[objects[obj_i].highlighted + 1];
            }else{
                new_i = 0;
            }console.log(typeof new_i, new_i);

            objects[obj_i].highlighted = new_i;
            _batchRemoveClass(objects[obj_i].options, 'highlighted');
            objects[obj_i].options[new_i].classList.add('highlighted');
        },

        _hideOptions = function(ignore){
            for(var i in objects){
                if(objects.hasOwnProperty(i) &&
                    typeof objects[i].options_wrap !== "undefined" &&
                    objects[i].options_wrap.style.display === "block"){
                    if(typeof ignore !== "undefined" && parseFloat(ignore) === parseFloat(i))
                        continue;
                    objects[i].options_wrap.style.display = "none";
                    objects[i].options_wrap.style.zIndex = "auto";
                    objects[i].new_select.classList.toggle('selected');
                }
            }

            return false;
        },

        _toggleOptions = function(i){
            _hideOptions(i);
            objects[i].options_wrap.style.display = (objects[i].options_wrap.style.display === "block")? "none" : "block" ;
            objects[i].options_wrap.style.zIndex = (objects[i].options_wrap.style.display === "block")? "10000" : "auto" ;
            objects[i].new_select.classList.toggle('selected');
            objects[i].options_wrap.addEventListener('click', function(e){e.stopPropagation();});

            if(objects[i].options_wrap.style.display === "block" && objects[i].searchable){
                _resetSearch(i);
                _highlightOption(i);
                objects[i].search.value = "";
                objects[i].search.focus();
            }

            return false;
        },

        _select = function(el, i){
            if(el.hasAttribute("data-disabled") && el.getAttribute("data-disabled") === "disabled")
                return false;

            if(objects.hasOwnProperty(i)){

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

                objects[i].original_input.value = el.getAttribute("data-value");

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
            if(el.hasAttribute("data-value"))
                window.location.assign(el.getAttribute("data-value"));

            return false;
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

            return false;
        },

        _buildLists = function(objs){
            [].forEach.call(objs, function(obj, index){
                var _objs = {
                        original_input : obj,
                        select_wrap : _createEl('div', {'class':'selectro-wrap', 'style':'position:relative;'}),
                        new_select : _createEl('div', {'style':'overflow:visible;position:relative;', 'class':obj.classList, 'id':(obj.hasAttribute('id'))? 'selectro_'+obj.getAttribute('id') : 'selectro_'+index, 'tabindex':(obj.hasAttribute('tabindex'))? obj.getAttribute('tabindex') : (index + 1)}),
                        label : _createEl('span', {'class':'selectro-label default'}),
                        arrow : _createEl('span', {'class':'selectro-arrow', 'style':'display:inline-block;position:relative;vertical-align:middle;border-color:rgb(140,140,140) transparent transparent transparent;border-width:7px 5px 0 5px;border-style:solid;width:0;height:0;'}),
                        options_wrap : _createEl('div', {'style':'position:absolute;display:none;', 'class':'selectro-options-wrap'}),
                        new_options : _createEl('div', {'class':'selectro-options'}),
                        options : [],
                        highlighted : -1,
                        searchable : obj.classList.contains('searchable')
                    },
                    object_count = objects.length,
                    label = (obj.hasAttribute('data-label'))? obj.getAttribute('data-label') : "Select an Option",
                    select_children = obj.children,
                    sibling = obj.nextElementSibling;

                if(_objs.searchable) {
                    _objs.search_wrap = _createEl('div', {'class':'selectro-search-wrap', 'style':'overflow:auto;'});
                    _objs.search = _createEl('input', {'class':'selectro-search', 'type':'text'});
                    _objs.search_icon = _createEl('div', {'class':'selectro-search-icon', 'style':'float:right;'});
                    _objs.no_match = _createEl('div', {'class':'selectro-no-matches'});
                    _objs.matches = [];

                    _objs.options_wrap.appendChild(_objs.search_wrap);
                    _objs.search_wrap.appendChild(_objs.search_icon);
                    _objs.search_wrap.appendChild(_objs.search);

                    _objs.search.addEventListener('paste', function(){
                        // @TODO: Timeout used until clipboardData is accessible in a consistent cross-browser environment. 12-24-2014
                        setTimeout(function(){
                            _search(_objs.search, object_count);
                        }, 20);
                    }, false);

                    _objs.search.addEventListener('focus', function(){
                        _search(_objs.search, object_count);
                    });
                }

                [].forEach.call(select_children, function(el){
                    var _create_obj = function(obj){
                        if(!obj.hasAttribute('value')){
                            if(obj === select_children[0]){
                                if(label === "Select an Option")
                                    label = el.value;
                                _objs.original_input.value = "";
                            }
                            return;
                        }

                        var new_option = _createEl('div', {'class':'selectro-option', 'style': 'display:block;position:relative;', 'data-value': obj.value});

                        _setText(new_option, _getText(obj));
                        _objs.new_options.appendChild(new_option);

                        if(_configs.links)
                            new_option.addEventListener("click", function(){_link(this);});
                        else
                            new_option.addEventListener("click", function(){_select(this, object_count);});

                        if(obj.hasAttribute('selected') && !obj.hasAttribute('disabled')){
                            new_option.classList.add('selected');
                            _setText(_objs.label, _getText(obj));
                            _objs.label.classList.remove('default');
                        }else if(obj.hasAttribute('disabled')){
                            _setAttributes(new_option, {'data-disabled':'disabled'});
                            new_option.classList.add('disabled');
                        }

                        _objs.options.push(new_option);

                        if(_objs.searchable) {
                            if(_objs.options.length == 1)
                                _objs.matches.push(0);
                            else
                                _objs.matches.push(parseInt(_objs.options.length - 1));
                        }

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
                }, false);

                document.addEventListener('click', function(){
                    _hideOptions();
                }, false);

                window.addEventListener('keyup', function(){
                    var keys = [38, 40],
                        key = event.keyCode;

                    if(keys.indexOf(key) !== -1)
                        _highlightOption(object_count, key);
                    else if(_objs.searchable === true && _objs.search === document.activeElement)
                        _search(_objs.search, object_count);
                }, false);

                window.addEventListener('keydown', function(){
                    if(event.keyCode == 13 && _objs.highlighted !== -1)
                        _select(_objs.options[_objs.highlighted], object_count);
                }, false);

                objects.push(_objs);

                obj.style.display = "none";
            });

            return false;
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
                    select_children = obj.children,
                    sibling = obj.nextElementSibling;

                [].forEach.call(select_children, function(el){
                    var _create_obj = function(obj){
                        if(!obj.hasAttribute('value')){
                            if(obj === select_children[0]){
                                _objs.original_input.value = "";
                            }
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

            return false;
        };

    selectro.init = function(configs){
        var selects = document.querySelectorAll(".selectro"),
            grids = document.querySelectorAll(".selectro-grid"),
            browser = _browser();

        if((selects.length === 0 && grids.length === 0) ||
            (browser.name === "msie" && parseFloat(browser.version) <= 9))
            return;

        if(typeof configs !== "undefined" && typeof configs === "object")
            _setConfigs(configs);

        if(typeof _configs.beforeInit === "function")
            _configs.beforeInit();

        if(browser.name === "mobile" && selects.length > 0){
            _buildMobile(selects);
            return;
        }

        if(selects.length > 0)
            _buildLists(selects);
        if(grids.length > 0)
            _buildGrids(grids);

        if(typeof _configs.afterInit === "function")
            _configs.afterInit(objects);

        return false;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();