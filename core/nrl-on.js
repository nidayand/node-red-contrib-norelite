module.exports = function (RED) {
    "use strict";

    var common = require("../lib/common");
    var NMsg = require("../lib/msg");

    function NoreliteOn(n){
        RED.nodes.createNode(this, n);
        var self = this;

        common.setStatus(self,1,"Active");

        var msg = new NMsg(self);

        setTimeout(function(){
          self.send(msg.toMessageObject());
        }, 2500);


        var timer = setInterval(function(){
            self.send(msg.toMessageObject());
        }, 60*1000);

        self.on("close", function(){
            clearInterval(timer);
            common.setStatus(self);
        });

    }
    RED.nodes.registerType("nrl-on in", NoreliteOn);
}
