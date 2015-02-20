SELECTRO
========

Introduction
------------

Selectro was designed to be a small, but robust library that allows developers to easily swap out traditional select elements with a customizable widget.
 
### Using Selectro

#### Selectro Lists (Drop-downs)

The default option is to create a select widget that acts like a select element, but can be treated like a drop-down.

1. To use Selectro add selectro.js to the head of your application.
2. Add the class `selectro` to select elements that you wish to turn into Selectro drop-downs.
3. If you would like to add search functionality to a specific Selctro drop-down add the class `searchable` to the original select.
4. The default label for a Selectro drop-down "Choose an Option". To change the default label add `data-label="Your Custom Label"` to the original select. Setting this data attribute overrides the global `label` option for that select only.
5. Multiple selects are supported! Nothing additional is required to initialize a multiple select. Multiple selects do not require the `searchable` class as Selectro Multi-Selects automatically get a search box.

#### Initializing Selectro

In your document ready function, call `selectro();`

There are four configuration options available when calling `selectro();`

| Option | Acceptable Values | Default Value | Description |
| ------ | ----------------- | --------------| ----------- |
| `label` | `String` or `false` | 'Select an Option' | The `label` option is the global default value for a Selectro (no options selected). |
| `links` | `true` or `false` | `false` | The `links` option turns a Selectro list into a drop-down menu. To make this work you must use a URL as the value attribute in the original select options. The default is false. Expects boolean true, or false. |
| `no_match` | `String` or `false` | 'No options were found matching your search' | The `no_match` option is used to set a global message for the users search query when none of the options match. If the select does not have the searchable attribute, or is not a multiple select, this option is ignored. |
| `afterSelect` | `function` or `false` | `false` | The afterSelect option is a callback function that runs after every Selectro element has an option selected. The default is false. Expects a function. Passes all Selectro elements in an array as the first method variable, and the selected element as the second variable. |

To use global configurations call `selectro` like this:

```selectro({
    label : "Select Options",
    links : true,
    no_match : "No matches found!",
    afterSelect : function(){}
});```