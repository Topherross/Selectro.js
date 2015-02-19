(function () {
    'use strict';

    // Fallback for IE 7/8
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            for (var i = 0, len = this.length; i < len; ++i) {
                fn.call(scope || this, this[i], i, this);
            }
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;

            if (this == null)
                throw new TypeError('"this" is null or not defined');

            var O = Object(this),
                len = O.length >>> 0;

            if (len === 0)
                return -1;

            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity)
                n = 0;

            if (n >= len)
                return -1;

            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            while (k < len) {
                if (k in O && O[k] === searchElement)
                    return k;
                k++;
            }
            return -1;
        };
    }

    var Selectro,
        selectro,
        current_selectro,
        _configs,
        _event = function(target, event, func, bubbles){
            var _bubbles = (typeof bubbles !== "undefined" && !!bubbles)? bubbles : false;

            if(document.addEventListener)
                target.addEventListener(event, function(e){func(e);}, _bubbles);
            else
                target.attachEvent("on"+event, function(e){func(e);});
        },

        _stop = function(event){
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
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

        _setAttributes = function(el, attrs){
            for(var attr in attrs){
                if(attrs.hasOwnProperty(attr))
                    el.setAttribute(attr, attrs[attr]);
            }

            return false;
        },

        _createEl = function(type, attrs, text, html){
            var el = document.createElement(type);
            if(typeof attrs !== "undefined")
                _setAttributes(el, attrs);

            if(typeof text !== "undefined") {
                if (typeof html !== "undefined")
                    _setText(el, text, true);
                else
                    _setText(el, text);
            }

            return el;
        },
        _hasClass = function(obj, klass){
            var class_list = obj.getAttribute('class').split(' ');

            if(typeof class_list !== "undefined") {
                for (var class_name in class_list) {
                    if (class_list.hasOwnProperty(class_name) && class_list[class_name] == klass) {
                        return true;
                    }
                }
            }

            return false;
        },
        _removeClass = function(obj, klass){
            var class_list = obj.getAttribute('class').split(' ');

            for(var class_name in class_list){
                if(class_list.hasOwnProperty(class_name) && class_list[class_name] == klass){
                    class_list.splice(class_name, 1);
                    obj.setAttribute('class', class_list.join(' '));
                    break;
                }
            }

            return false;
        },
        _addClass = function(obj, klass){
            var class_list = obj.getAttribute('class').split(' ');

            if(!_hasClass(obj, klass)) {
                class_list.push(klass);
                obj.setAttribute('class', class_list.join(' '));
            }

            return false;
        },
        _batchRemoveClass = function(objs, klass){
            for(var obj in objs){
                if(objs.hasOwnProperty(obj) && obj != 'length' && obj != 'item' && objs[obj].hasAttribute('class'))
                    _removeClass(objs[obj], klass);
            }
            return false;
        };

    Selectro = (function(window, document){

        function Selectro(select){
            if(typeof this === "undefined" || typeof select === "undefined" || select.hasAttribute('data-initialized'))
                return;

            this.original_select = select;
            this.label = (select.hasAttribute('data-label'))? select.getAttribute('data-label') : (!!_configs.label)? _configs.label : "Select an Option";
            this.multiple = (select.hasAttribute('multiple') && select.getAttribute('multiple') === "multiple");
            this.select_wrap = _createEl('div', {'class':'selectro-wrap'});
            this.new_select = _createEl('div', {
                'class':select.classList,
                'id':(select.hasAttribute('id'))? 'selectro_'+select.getAttribute('id') : '',
                'tabindex':(select.hasAttribute('tabindex'))? select.getAttribute('tabindex') : '0'
            });

            if(!!this.multiple){
                _addClass(this.new_select, 'multiple');
                this.multi_input_wrap = _createEl('div', {'class':'selectro-multiple-input-wrap'});
                this.multi_input = _createEl('input', {
                    'type' : 'text',
                    'class': 'selectro-multiple-input',
                    'placeholder' : this.label
                });
                this.options_selected = [];
            }else{
                this.select_label = _createEl('span', {'class':'selectro-label default'});
                this.arrow = _createEl('span', {'class':'selectro-arrow'});
            }

            this.options_wrap = _createEl('div', {'class':'selectro-options-wrap'});
            this.new_options = _createEl('div', {'class':'selectro-options'});
            this.options = [];
            this.matches = [];
            this.highlighted = -1;
            this.options_visible = false;
            this.searchable = (!this.multiple)? _hasClass(select, 'searchable') : false;

            if(this.searchable) {
                this.search_wrap = _createEl('div', {'class':'selectro-search-wrap'});
                this.search_input = _createEl('input', {'class':'selectro-search', 'type':'text'});
                this.search_icon = _createEl('div', {'class':'selectro-search-icon'});
            }

            if(!!this.searchable || !!this.multiple){
                this.no_match = _createEl('div', {'class':'selectro-no-matches'}, ((!!_configs.no_match)? _configs.no_match : "No options were found matching your search"));
            }

            this.build_html();
            this.bind_events();

            this.original_select.parentNode.insertBefore(this.select_wrap, this.original_select.nextElementSibling);
            select.setAttribute('data-initialized', 'true');
            select.style.display = "none";
        }

        Selectro.prototype.add_optgroup = function(index){
            if(typeof index === "undefined")
                return false;

            if(this.original_select.children[index].hasAttribute("label")){
                this.new_options.appendChild(_createEl("h6", {'class':'selectro-optgroup-header'}, this.original_select.children[index].getAttribute("label")));
                for(var child in this.original_select.children[index].children){
                    if(this.original_select.children[index].children.hasOwnProperty(child) && child !== "length"){
                        this.add_option(this.original_select.children[index].children[child]);
                    }
                }
            }
        };

        Selectro.prototype.add_option = function(option){
            if(!option.hasAttribute('value')){
                if(option === this.original_select.children[0]){
                    this.original_select.value = "";
                }
                return;
            }

            var new_option = _createEl('div', {'class':'selectro-option', 'data-value': option.value}, _getText(option));
            this.new_options.appendChild(new_option);

            if(_configs.links)
                _event(new_option, "click", this.option_link.bind(this), false);
            else if(!!this.multiple)
                _event(new_option, "click", this.select_option_multiple.bind(this), false);
            else
                _event(new_option, "click", this.select_option.bind(this), false);

            if(option.hasAttribute('selected') && !option.hasAttribute('disabled')){
                _addClass(new_option, 'selected');
                _setText(this.label, _getText(option));
                _removeClass(this.label, 'default');
            }else if(option.hasAttribute('disabled')){
                _setAttributes(new_option, {'data-disabled':'disabled'});
                _addClass(new_option, 'disabled');
            }

            this.options.push(new_option);

            if(!option.hasAttribute('disabled')) {
                if(this.options.length == 1)
                    this.matches.push(0);
                else
                    this.matches.push(this.options.indexOf(new_option));
            }
        };

        Selectro.prototype.build_html = function(){
            for(var obj in this.original_select.children){
                if(this.original_select.children.hasOwnProperty(obj) && obj !== "length"){
                    if(this.original_select.children[obj].tagName.toLowerCase() === "optgroup"){
                        this.add_optgroup(obj);
                    }else{
                        this.add_option(this.original_select.children[obj]);
                    }
                }
            }

            if(this.searchable){
                this.options_wrap.appendChild(this.search_wrap);
                this.search_wrap.appendChild(this.search_icon);
                this.search_wrap.appendChild(this.search_input);
            }

            if(!this.multiple) {
                _setText(this.select_label, this.label);
                this.new_select.appendChild(this.select_label);
                this.new_select.appendChild(this.arrow);
            }else{
                this.multi_input_wrap.appendChild(this.multi_input);
                this.new_select.appendChild(this.multi_input_wrap);
            }

            this.options_wrap.appendChild(this.new_options);

            this.select_wrap.appendChild(this.new_select);
            this.select_wrap.appendChild(this.options_wrap);
        };

        Selectro.prototype.toggle_options = function(stop){
            if(typeof stop === "boolean" && !!stop)
                _stop(event);

            if(typeof current_selectro !== "undefined" &&
                current_selectro.options_visible &&
                current_selectro != this)
                current_selectro.hide_options();

            current_selectro = this;

            if(!!this.multiple){
                if(this.multi_input == document.activeElement){

                }
            }

            if(this.options_visible === true)
                this.hide_options();
            else if(this.options_visible === false)
                this.show_options();

            return false;
        };

        Selectro.prototype.hide_options = function(){
            if(this.options_visible === true){
                this.options_wrap.style.display = "none";
                this.options_wrap.style.zIndex = "auto";
                _removeClass(this.new_select, 'selected');
                this.options_visible = false;
                _batchRemoveClass(this.options, 'highlighted');
                this.highlighted = -1;

                if(!!this.multiple)
                    this.multi_input.value = "";

                if(!!this.searchable)
                    this.search_input.value = "";

                if(!!this.multiple || !!this.searchable){
                    this.search_options();
                    this.new_select.focus();
                }
            }

            return false;
        };

        Selectro.prototype.show_options = function(){
            if(this.options_visible === false) {
                this.options_wrap.style.display = "block";
                this.options_wrap.style.zIndex = "10000";
                _addClass(this.new_select, 'selected');
                _event(this.options_wrap, 'click', function (event) {
                    _stop(event);
                });
                this.options_visible = true;

                if (!!this.searchable &&
                    this.search_input != document.activeElement)
                    this.search_input.focus();

                if(!!this.multiple &&
                    this.multi_input != document.activeElement)
                    this.multi_input.focus();

                this.new_options.scrollTop = 0;
            }

            return false;
        };

        Selectro.prototype.bind_events = function(){
            _event(this.new_select, 'click', this.toggle_options.bind(this, true), false);
            _event(document, 'click', this.hide_options.bind(this), false);

            if(!!this.searchable){
                _event(this.search_input, 'paste', (function(){
                    // @TODO: Timeout used until clipboardData is accessible in a consistent cross-browser environment. 12-24-2014
                    setTimeout((function(){
                        this.search_options.bind(this);
                    }).bind(this), 20);
                }).bind(this), false);

                _event(this.search_input, 'keyup', (function(){
                    var keys = [38, 40],
                        key = event.keyCode || event.which;

                    if ( keys.indexOf(key) !== -1 && this.options_visible )
                        this.highlight_option(key);
                    else if ( keys.indexOf(key) === -1 )
                        this.search_options();
                }).bind(this), false);

                _event(this.search_input, 'keydown', (function(event){
                    var key = event.keyCode || event.which;
                    if (key == 13 && this.highlighted !== -1)
                        this.select_option();
                    else if ( key == 9 && this.options_visible )
                        this.hide_options();
                }).bind(this), false);
            }

            if(!!this.multiple){
                _event(this.multi_input, 'paste', (function(){
                    // @TODO: Timeout used until clipboardData is accessible in a consistent cross-browser environment. 12-24-2014
                    setTimeout((function(){
                        this.search_options();
                    }).bind(this), 20);
                }).bind(this), false);
            }

            _event(this.new_select, 'keyup', (function(event){
                var keys = [38, 40],
                    key = event.keyCode || event.which;

                if ( key == 38 && this.options_visible && this.highlighted == 0 )
                    this.hide_options();
                else if ( key == 40 && !this.options_visible )
                    this.show_options();
                else if ( keys.indexOf(key) !== -1 && this.options_visible )
                    this.highlight_option(key);
                else if ( keys.indexOf(key) === -1 && !!this.multiple )
                    this.search_options();

            }).bind(this), false);

            _event(this.new_select, 'keydown', (function(event){
                var key = event.keyCode || event.which;

                if(key == 13 && !!this.multiple)
                    event.preventDefault();

                if (key == 13 && this.highlighted !== -1 && !this.multiple)
                    this.select_option();
                else if (key == 13 && this.highlighted !== -1 && !!this.multiple)
                    this.select_option_multiple();
                else if ( key == 9 && this.options_visible )
                    this.hide_options();
            }).bind(this), false);
        };

        Selectro.prototype.select_option_multiple_remove = function(){
            event.stopPropagation();

            var option = event.target.parentNode,
                i = option.getAttribute('data-option-index');

            this.options[i].removeAttribute('data-disabled');
            _removeClass(this.options[i], 'disabled');

            this.new_select.removeChild(option);
            this.hide_options();
        };

        Selectro.prototype.select_option_multiple = function(){
            var i = (this.highlighted === -1)? this.options.indexOf(event.target) : this.matches[this.highlighted];

            if(this.options[i].hasAttribute("data-disabled") &&
                this.options[i].getAttribute("data-disabled") === "disabled")
                    return false;

            var option_remove = _createEl('div', {'class':'selectro-option-multiple-remove'}),
                selected_option = _createEl('div', {'class':'selectro-option-multiple', 'data-option-index':i}, _getText(this.options[i]));

            this.options[i].setAttribute('data-disabled', 'disabled');
            _addClass(this.options[i], 'disabled');

            _event(option_remove, 'click', this.select_option_multiple_remove.bind(this), false);

            selected_option.appendChild(option_remove);
            this.new_select.insertBefore(selected_option, this.multi_input_wrap);

            this.hide_options();

            if(typeof _configs.afterSelect === "function")
                _configs.afterSelect();

            return false;
        };

        Selectro.prototype.select_option = function(){
            var i = (this.highlighted === -1)? this.options.indexOf(event.target) : this.matches[this.highlighted];

            if(this.options[i].hasAttribute("data-disabled") &&
                this.options[i].getAttribute("data-disabled") === "disabled")
                    return false;

            this.original_select.value = this.options[i].getAttribute("data-value");

            _setText(this.select_label, _getText(this.options[i]));

            if(_hasClass(this.select_label, 'default'))
                _removeClass(this.select_label, 'default');

            this.hide_options();

            if(typeof _configs.afterSelect === "function")
                _configs.afterSelect();

            return false;
        };

        Selectro.prototype.option_link = function(){
            if(event.target.hasAttribute("data-value"))
                window.location.assign(event.target.getAttribute("data-value"));

            return false;
        };

        Selectro.prototype.reset_scroll = function(){
            if(this.highlighted === -1)
                return false;

            var option_top = this.options[this.matches[this.highlighted]].getBoundingClientRect().top - this.new_options.getBoundingClientRect().top,
                option_bottom = option_top + this.options[this.matches[this.highlighted]].offsetHeight;

            if(option_top < 0)
                this.new_options.scrollTop -= Math.abs(option_top);
            else if(option_bottom > this.new_options.clientHeight)
                this.new_options.scrollTop += (option_bottom - this.new_options.clientHeight);

            return false;
        };

        Selectro.prototype.highlight_option = function(key){
            if(this.matches.length == 0)
                return false;

            var highlighted = (this.highlighted === -1)? this.matches[0] : this.highlighted,
                match_index;

            if(typeof key !== "undefined") {
                if (key == 38) {
                    match_index = (highlighted == 0) ? 0 : this.highlighted - 1;
                }
                if (key == 40) {
                    match_index = ((highlighted + 1) > (this.matches.length - 1)) ? this.matches.length - 1 : this.highlighted + 1;
                }
            }else{
                match_index = 0;
            }

            this.highlighted = match_index;
            _batchRemoveClass(this.options, 'highlighted');
            _addClass(this.options[this.matches[match_index]], 'highlighted');
            this.reset_scroll();

            return false;
        };

        Selectro.prototype.search_options = function(){
            var matches = false,
                search_field = (!!this.multiple)? this.multi_input : this.search_input;

            this.matches = [];

            for(var option in this.options){
                if(this.options.hasOwnProperty(option)){
                    var el_text = _getText(this.options[option]).toLowerCase();
                    if(el_text.indexOf(search_field.value.toLowerCase()) === -1){
                        this.options[option].style.display = "none";
                    }else{
                        if(matches === false)
                            matches = true;
                        this.options[option].style.display = "block";
                        if(!this.options[option].hasAttribute('data-disabled'))
                            this.matches.push(parseInt(option));
                    }
                }
            }

            if(!matches)
                this.new_options.appendChild(this.no_match);
            else if(matches && this.no_match.parentNode !== null)
                this.new_options.removeChild(this.no_match);

            return false;
        };

        return Selectro;
    })(window, document);

    selectro = function(configs){
        var selects = document.querySelectorAll(".selectro");

        if(selects.length === 0)
            return false;

        _configs = {
            links : configs.links || false,
            label : configs.label || false,
            no_match : configs.no_match || false,
            afterSelect : configs.afterSelect || false
        };

        [].forEach.call(selects, function(select){
            new Selectro(select);
        });

        return false;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();
