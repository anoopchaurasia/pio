/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
 fm.Package("");
 fm.Class("webPath");
 webPath = function (me) {
     Static.path = {
        "pio" : {'class':"app.Pio"}
	};
    Static.sources = './web/';
	Static.packages = {pio: "classes"};
};
