(function () {
    'use strict';
    var selectro = {};

    selectro.init = function(){
        console.log("Selectro AWAY!!!");
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = selectro;
    } else {
        window.selectro = selectro;
    }
})();