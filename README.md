# SELECTRO

## Introduction

Selectro was designed to be a small, but robust library that allows developers to easily swap out traditional select elements with a customizable widget.

## Compatibility Notice

1. Selectro is compatible with all modern desktop browsers (Chrome, Safari, FireFox), and IE 10+.
2. It was a conscious decision to allow mobile devices to utilize the native select feature of the device. For this reason Selectro is not compatible with mobile operating systems.
 
### Using Selectro

1. To use Selectro add selectro.js to the head of your application.
2. Add the class `selectro` to select elements that you wish to turn into Selectro drop-downs.
3. Multiple selects are supported! Nothing additional is required to initialize a multiple select. 

### Initializing Selectro

In your document ready function, call `selectro();`

### Selectro Global Configuration Options

Global configurations are applied to all selects created when calling `selectro();`.
Adding another select to the DOM, and invoking `selectro();` again will allow you to apply another set of configurations to the newly created Selctro elements. Previous configurations will not apply.

There are four configuration options available when calling `selectro();`

| Option | Acceptable Values | Default Value | Description |
| ------ | ----------------- | --------------| ----------- |
| `label` | `String` or `false` | 'Select an Option' | The `label` option is the global default value for a Selectro (no options selected). |
| `no_match` | `String` or `false` | 'No options were found matching your search' | The `no_match` option is used to set a global message for the users search query when none of the options match. If the select does not have the searchable attribute, or is not a multiple select, this option is ignored. |
| `afterSelect` | `function` or `false` | `false` | The afterSelect option is a callback function that runs after every Selectro element has an option selected. The default is false. Expects a function. Passes all Selectro elements in an array as the first method variable, and the selected element as the second variable. |

To use global configurations call `selectro` like this:

```javascript
selectro({
    label : "Select Options",
    no_match : "No matches found!",
    afterSelect : function(){}
});
```

### Individual Selctro Configuration options

1. If you would like to add search functionality to a specific Selctro drop-down add the class `searchable` to the original select. Selectro Multi-Selects automatically get a search box, and __DO NOT__ require the `searchable` class.   
2. Selectro supports an optional 'icon' div that can be added to every option element within that Selectro. To enable option Icons add the class `option-icons` to the original select.   
3. To override the global `label` configuration, or the default for an individual Selectro; add `data-label="[Your Custom Label]"` to the original select.   
4. To override the global `no_match` configuration, or the default for an individual Selectro; add `data-no-match="[Your Custom no-match String]"` to the original select.   
5. To override the global `afterSelect` configuration add `data-after-select="[Your Custom Function Reference]"` to the original select.
    * __INCORRECT__ pass a function call; `data-after-select="myFunction()"`. __DO NOT__ add the `()` at the end of your function.
    * __CORRECT__ passing a function reference; `data-after-select="myFunction"`
