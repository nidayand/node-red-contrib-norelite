/*jslint node: true */
module.exports = function (RED) {
    "use strict";
    var common = require('../lib/common');
    var Message = require("../lib/msg");
    var Helper = require("../lib/helper");
  
  
    /*
        Defines the output node for a rule. Copied to a large extent from 66-mongodb.js
    */
    function NoreliteHassSwitchOutNode(config) {
      RED.nodes.createNode(this, config);
      var self = this;
      self.toggle = config.toggle;
  
      common.setStatus(self);
  
      /* When a message is received */
      self.on("input", function (msg) {
        var omsg = new Message(self, msg);
        //Convert color to RGB
        var color = Helper.getColorHexToRgb(omsg.getColor());

        //Check if toggle is set in incoming message
        var toggleInMessage = (typeof msg.toggle === "boolean" && msg.toggle);
        
        var nmsg = {
            payload: {
                "service" : "",
                "data" : {
                }    
            }
        };

        if (omsg.is_enabled()){
            if (self.toggle || toggleInMessage){
                nmsg.payload.service = "toggle";
                common.setStatus(self, 1, "Toggle");
            } else {
                nmsg.payload.service = "turn_on";
                common.setStatus(self, 1, "On");
            }
        } else {
            nmsg.payload.service = "turn_off";
            common.setStatus(self, -1, "Off");
        }
  
        //Also passing the original instruction if
        nmsg.instruction = omsg.toMessageObject();
  
        self.send(nmsg);
      });
  
    }
    RED.nodes.registerType("switch-out", NoreliteHassSwitchOutNode);
  };
  