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
4. The default label for a Selectro drop-down "Choose an Option". To change the default label add `data-label="Your Custom Label"` to the original select.

#### Selectro Grids

Another option available is to make a Selectro grid. A grid Selectro can be styled like a group of checkboxes.  

1. To create a Selectro grid just add the class `selectro-grid` original select element.

#### Initializing Selectro

In your document ready function, call `selectro.init();`

There are four configuration options available when calling `selectro.init();`

| Option | Description |
| ------- | ------------ |
| links | The links option turns a Selectro list into a drop-down menu. To make this work you must use a URL as the value attribute in the original select options. The default is false. Expects boolean true, or false. |
| beforeInit | The beforeInit option is a callback function that runs before Selectro actually runs the init function. The default is false. Expects a function. |
| afterInit | The afterInit option is a callback function that runs right after Selectro runs the init function. The default is false. Expects a function. Passes all Selectro elements in an array as a method variable. |
| afterSelect | The afterSelect option is a callback function that runs after every Selctro element has an option selected. The default is false. Expects a function. Passes all Selectro elements in an array as the first method variable, and the selected element as the second variable. |