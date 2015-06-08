(function () {
    'use strict';

    var $selectro,
        $configs,
        $browser = window.navigator.userAgent,
        $mobile_regex = /i(Phone|Pod|Pad)|Android|Blackberry|Opera Mini|Opera Mobi/i,
        $msie_regex = /msie|trident/i,

        setText = function (el, text, html) {
            if (typeof html !== "undefined" && html === true)
                el.innerHTML = text;
            else if (document.all)
                el.innerText = text;
            else
                el.textContent = text;

            return false;
        },

        getText = function (el) {
            return (document.all) ? el.innerText : el.textContent;
        },

        setAttributes = function (el, attrs) {
            for (var attr in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, attr))
                    el.setAttribute(attr, attrs[attr]);
            }

            return false;
        },

        createEl = function (type, attrs, text, html) {
            var el = document.createElement(type);
            if (typeof attrs !== "undefined")
                setAttributes(el, attrs);

            if (typeof text !== "undefined") {
                if (typeof html !== "undefined")
                    setText(el, text, true);
                else
                    setText(el, text);
            }

            return el;
        },

        batchRemoveClass = function (objs, klass) {
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].classList.contains(klass))
                    objs[i].classList.remove(klass);
            }

            return false;
        },

        Selectro = {
            trigger: function (func) {
                var fn = window[func];

                if (typeof fn === "function")
                    fn();

                return false;
            },

            addOptGroup: function (index) {
                if (typeof index === "undefined")
                    return false;

                if (this.original_select.children[index].hasAttribute("label"))
                    this.new_options.appendChild(
                        createEl("h6", {'class': 'selectro-optgroup-header'}, this.original_select.children[index].getAttribute("label")));

                for (var i = 0; i < this.original_select.children[index].children.length; i++)
                    this.addOption(this.original_select.children[index].children[i]);
            },

            addOption: function (option) {
                if (!option.hasAttribute('value')) {
                    if (option === this.original_select.children[0])
                        this.original_select.value = "";
                    return;
                }

                var new_option = createEl('div', {
                    'class': 'selectro-option',
                    'data-value': option.value
                }, getText(option));

                if (!!this.option_icons) {
                    var icon = createEl('div', {
                        'class': 'selectro-option-icon',
                        'id': 'option_icon_' + option.value
                    });
                    new_option.appendChild(icon);
                }

                this.new_options.appendChild(new_option);
                this.options.push(new_option);

                if (!option.hasAttribute('disabled')) {
                    if (this.options.length == 1)
                        this.matches.push(0);
                    else
                        this.matches.push(this.options.indexOf(new_option));
                }

               new_option.addEventListener("click", (function (event) {
                    this.selectOption(event);
                }).bind(this), false);

                if (option.hasAttribute('selected') && !option.hasAttribute('disabled')) {
                    new_option.classList.add('selected');
                } else if (option.hasAttribute('disabled')) {
                    setAttributes(new_option, {'data-disabled': 'disabled'});
                    new_option.classList.add('disabled');
                }
            },

            toggleOptions: function (event, stop) {
                if (typeof stop === "boolean" && !!stop)
                    event.stopPropagation();

                if (typeof $selectro !== "undefined" &&
                    $selectro.options_visible &&
                    $selectro != this)
                    $selectro.hideOptions();

                $selectro = this;

                if (this.options_visible === true)
                    this.hideOptions();
                else if (this.options_visible === false)
                    this.showOptions();

                return false;
            },

            hideOptions: function () {
                if (this.options_visible === true) {
                    this.options_wrap.style.display = "none";
                    this.options_wrap.style.zIndex = "auto";
                    this.new_select.classList.remove('selected');
                    this.options_visible = false;
                    batchRemoveClass(this.options, 'highlighted');
                    this.highlighted = -1;

                    if (!!this.multiple)
                        this.multi_input.value = "";

                    if (!!this.searchable)
                        this.search_input.value = "";

                    if (!!this.multiple || !!this.searchable) {
                        this.searchOptions();
                        this.new_select.focus();
                    }
                }

                return false;
            },

            showOptions: function () {
                if (this.options_visible === false) {
                    this.options_wrap.style.display = "block";
                    this.options_wrap.style.zIndex = "10000";
                    this.new_select.classList.add('selected');
                    this.options_wrap.addEventListener('click', function (event) {
                        event.stopPropagation();
                    });
                    this.options_visible = true;

                    if (!!this.searchable &&
                        this.search_input != document.activeElement)
                        this.search_input.focus();

                    if (!!this.multiple &&
                        this.multi_input != document.activeElement)
                        this.multi_input.focus();

                    this.new_options.scrollTop = 0;
                }

                return false;
            },

            resetScroll: function () {
                if (this.highlighted === -1)
                    return false;

                var option_top = this.options[this.matches[this.highlighted]].getBoundingClientRect().top - this.new_options.getBoundingClientRect().top,
                    option_bottom = option_top + this.options[this.matches[this.highlighted]].offsetHeight;

                if (option_top < 0)
                    this.new_options.scrollTop -= Math.abs(option_top);
                else if (option_bottom > this.new_options.clientHeight)
                    this.new_options.scrollTop += (option_bottom - this.new_options.clientHeight);

                return false;
            },

            highlightOption: function (key) {
                if (this.matches.length === 0)
                    return false;

                var highlighted = (this.highlighted === -1) ? this.matches[0] : this.highlighted,
                    match_index = 0;

                if (typeof key !== "undefined" && key == 38)
                    match_index = (highlighted === 0) ? 0 : this.highlighted - 1;
                if (typeof key !== "undefined" && key == 40)
                    match_index = ((highlighted + 1) > (this.matches.length - 1)) ? this.matches.length - 1 : this.highlighted + 1;

                this.highlighted = match_index;
                batchRemoveClass(this.options, 'highlighted');
                this.options[this.matches[match_index]].classList.add('highlighted');
                this.resetScroll();

                return false;
            },

            searchOptions: function () {
                var matches = false,
                    search_field = (!!this.multiple) ? this.multi_input : this.search_input;

                this.matches = [];

                for (var i = 0; i < this.options.length; i++) {
                    var el_text = getText(this.options[i]).toLowerCase();
                    if (el_text.indexOf(search_field.value.toLowerCase()) === -1) {
                        this.options[i].style.display = "none";
                    } else {
                        if (matches === false)
                            matches = true;

                        this.options[i].style.display = "block";
                        if (!this.options[i].hasAttribute('data-disabled'))
                            this.matches.push(parseInt(i));
                    }
                }

                if (!matches)
                    this.new_options.appendChild(this.no_match);
                else if (matches && this.no_match.parentNode !== null)
                    this.new_options.removeChild(this.no_match);

                return false;
            },

            selectOption: function (event, index) {
                var i = (!isNaN(parseFloat(index))) ? index : (this.highlighted === -1) ? this.options.indexOf(event.target) : this.matches[this.highlighted];

                if (this.options[i].hasAttribute("data-disabled") &&
                    this.options[i].getAttribute("data-disabled") === "disabled")
                    return false;

                if (!!this.multiple) {
                    var option_remove = createEl('div', {'class': 'selectro-option-multiple-remove'}),
                        selected_option = createEl('div', {
                            'class': 'selectro-option-multiple',
                            'data-option-index': i
                        }, getText(this.options[i]));

                    this.options[i].setAttribute('data-disabled', 'disabled');
                    this.options[i].classList.add('disabled');

                    option_remove.addEventListener('click', this.removeOption.bind(this), false);

                    selected_option.appendChild(option_remove);
                    this.new_select.insertBefore(selected_option, this.multi_input_wrap);

                    this.original_select.children[i].selected = true;
                } else {
                    this.original_select.value = this.options[i].getAttribute("data-value");

                    setText(this.select_label, getText(this.options[i]));

                    if (this.select_label.classList.contains('default'))
                        this.select_label.classList.remove('default');
                }

                this.hideOptions();

                if (this.original_select.hasAttribute('data-after-select'))
                    this.trigger(this.original_select.getAttribute('data-after-select'));
                else if (typeof $configs.afterSelect === "function")
                    $configs.afterSelect(getText(this.options[i]));

                return false;
            },

            removeOption: function (event) {
                event.stopPropagation();

                var option = event.target.parentNode,
                    index = option.getAttribute('data-option-index');

                this.options[index].removeAttribute('data-disabled');
                this.options[index].classList.remove('disabled');

                this.new_select.removeChild(option);
                this.original_select.children[index].selected = false;

                this.matches = [];

                for (var i = 0; i < this.options.length; i++)
                    if (!this.options[i].hasAttribute('data-disabled'))
                        this.matches.push(parseInt(i));

                this.hideOptions();
            },

            selectDefaultOptions: function () {
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].classList.contains('selected') && !this.options[i].classList.contains('disabled')) {
                        this.selectOption(null, (!!this.multiple) ? this.matches.indexOf(i) : i);
                    }
                }

                return false;
            },

            build: function (select) {
                if (typeof select === "undefined" ||
                    select.hasAttribute('data-selectro-initialized'))
                    return false;

                this.options = [];
                this.matches = [];
                this.highlighted = -1;
                this.options_visible = false;

                this.original_select = select;
                this.label = (this.original_select.hasAttribute('data-label')) ? this.original_select.getAttribute('data-label') : (!!$configs.label) ? $configs.label : "Select an Option";
                this.multiple = this.original_select.hasAttribute('multiple');
                this.select_wrap = createEl('div', {'class': 'selectro-wrap'});
                this.new_select = createEl('div', {
                    'class': (this.original_select.hasAttribute('class')) ? this.original_select.getAttribute('class') : '',
                    'id': (this.original_select.hasAttribute('id')) ? 'selectro_' + this.original_select.getAttribute('id') : '',
                    'tabindex': (this.original_select.hasAttribute('tabindex')) ? this.original_select.getAttribute('tabindex') : '0'
                });

                if (!!this.multiple) {
                    this.new_select.classList.add('multiple');
                    this.multi_input_wrap = createEl('div', {'class': 'selectro-multiple-input-wrap'});
                    this.multi_input = createEl('input', {
                        'type': 'text',
                        'class': 'selectro-multiple-input',
                        'placeholder': this.label
                    });
                } else {
                    this.select_label = createEl('span', {'class': 'selectro-label default'});
                    this.arrow = createEl('span', {'class': 'selectro-arrow'});
                }

                this.options_wrap = createEl('div', {'class': 'selectro-options-wrap'});
                this.new_options = createEl('div', {'class': 'selectro-options'});

                this.option_icons = this.original_select.classList.contains('option-icons');
                this.searchable = (!this.multiple) ? this.original_select.classList.contains('searchable') : false;

                if (this.searchable) {
                    this.search_wrap = createEl('div', {'class': 'selectro-search-wrap'});
                    this.search_input = createEl('input', {'class': 'selectro-search', 'type': 'text'});
                    this.search_icon = createEl('div', {'class': 'selectro-search-icon'});
                }

                if (!!this.searchable || !!this.multiple)
                    this.no_match = createEl('div', {'class': 'selectro-no-matches'}, (this.original_select.hasAttribute('data-no-match'))? this.original_select.getAttribute('data-no-match') : ((!!$configs.no_match) ? $configs.no_match : "No options were found matching your search"));

                for (var i = 0; i < this.original_select.children.length; i++) {
                    if (this.original_select.children[i].tagName.toLowerCase() === "optgroup")
                        this.addOptGroup(i);
                    else
                        this.addOption(this.original_select.children[i]);
                }

                if (this.searchable) {
                    this.options_wrap.appendChild(this.search_wrap);
                    this.search_wrap.appendChild(this.search_icon);
                    this.search_wrap.appendChild(this.search_input);
                }

                if (!this.multiple) {
                    setText(this.select_label, this.label);
                    this.new_select.appendChild(this.select_label);
                    this.new_select.appendChild(this.arrow);
                } else {
                    this.multi_input_wrap.appendChild(this.multi_input);
                    this.new_select.appendChild(this.multi_input_wrap);
                }

                this.options_wrap.appendChild(this.new_options);

                this.select_wrap.appendChild(this.new_select);
                this.select_wrap.appendChild(this.options_wrap);

                this.new_select.addEventListener('click', (function (event) {
                    this.toggleOptions(event, true);
                }).bind(this), false);

                document.addEventListener('click', this.hideOptions.bind(this), false);

                if (!!this.searchable) {
                    this.search_input.addEventListener('paste', (function () {
                        // @TODO: Timeout used until clipboardData is accessible in a consistent cross-browser environment. 12-24-2014
                        setTimeout((function () {
                            this.searchOptions.bind(this);
                        }).bind(this), 20);
                    }).bind(this), false);

                    this.search_input.addEventListener('keyup', (function () {
                        var keys = [38, 40],
                            key = event.keyCode || event.which;

                        if (keys.indexOf(key) !== -1 && this.options_visible)
                            this.highlightOption(key);
                        else if (keys.indexOf(key) === -1)
                            this.searchOptions();
                    }).bind(this), false);

                    this.search_input.addEventListener('keydown', (function (event) {
                        var key = event.keyCode || event.which;

                        if (key == 13)
                            event.preventDefault();

                        if (key == 13 && this.highlighted !== -1)
                            this.selectOption(event);
                        else if (key == 9 && this.options_visible)
                            this.hideOptions();
                    }).bind(this), false);
                }

                if (!!this.multiple) {
                    this.multi_input.addEventListener('paste', (function () {
                        // @TODO: Timeout used until clipboardData is accessible in a consistent cross-browser environment. 12-24-2014
                        setTimeout((function () {
                            this.searchOptions();
                        }).bind(this), 20);
                    }).bind(this), false);
                }

                this.new_select.addEventListener('keyup', (function (event) {
                    var keys = [38, 40],
                        key = event.keyCode || event.which;

                    if (key == 38 && this.options_visible && this.highlighted === 0)
                        this.hideOptions();
                    else if (key == 40 && !this.options_visible)
                        this.showOptions();
                    else if (keys.indexOf(key) !== -1 && this.options_visible)
                        this.highlightOption(key);
                    else if (keys.indexOf(key) === -1 && !!this.multiple)
                        this.searchOptions();

                }).bind(this), false);

                this.new_select.addEventListener('keydown', (function (event) {
                    var key = event.keyCode || event.which;

                    if (key == 13)
                        event.preventDefault();

                    if (key == 13 && this.highlighted !== -1 && !this.multiple)
                        this.selectOption(event);
                    else if (key == 13 && this.highlighted !== -1 && !!this.multiple)
                        this.selectOption(event);
                    else if (key == 9 && this.options_visible)
                        this.hideOptions();
                }).bind(this), false);

                this.selectDefaultOptions();

                this.original_select.parentNode.insertBefore(this.select_wrap, this.original_select.nextElementSibling);
                this.original_select.setAttribute('data-selectro-initialized', 'true');
                this.original_select.style.display = "none";

                return false;
            }
        },

        selectro = function (configs) {
            if ($mobile_regex.test($browser))
                return false;

            if ($msie_regex.test($browser)) {
                var match = $browser.match(/(?:msie |rv:)(\d+(\.\d+)?)/i),
                    version = (match && match.length > 1 && match[1]) || '';

                if (Math.abs(parseFloat(version)) <= 10)
                    return false;
            }

            var selects = document.querySelectorAll(".selectro");

            if (selects === null || selects.length === 0)
                return false;

            $configs = {
                label: configs.label || false,
                no_match: configs.no_match || false,
                afterSelect: configs.afterSelect || false
            };

            for (var i = 0; i < selects.length; i++) {
                if (!selects[i].hasOwnProperty('data-selectro-initialized')) {
                    var _selectro = Object.create(Selectro);

                    _selectro.build(selects[i]);
                }
            }

            return false;
        };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();