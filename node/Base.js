/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("");
fm.AbstractClass("Base");
Base = function (me){this.setMe=function(_me){me=_me;};

    this.Abstract.method = function(){};
    this.POST = function(req, resp, method, query_parts){
      if(req.method === "POST") {
        if(query_parts.communication_key != "no_access_to_you_dude") {
          resp.end("good bye");
          console.log("post request without communication_key");
          return
        }
      }
       var method = method || 'method';
       var cls = this.getSub();
       console.log("method", method, req.params);
       cls[method](req, resp);
    };

    this.GET = function(req, resp, method){
        console.log("GET");
        this.POST(req, resp, method, true);
    };
};
