/*jslint node: true */
module.exports = function (RED) {
  "use strict";
  var common = require('../lib/common');
  var Message = require("../lib/msg");


  /*
      Defines the output node for a rule. Copied to a large extent from 66-mongodb.js
  */
  function NoreliteTellstickOutNode(config) {
    RED.nodes.createNode(this, config);
    var self = this;
    self.code = config.code;
    self.dimmable = config.dimmable;

    common.setStatus(self);

    /* When a message is received */
    self.on("input", function (msg) {
      var omsg = new Message(msg);

      var nmsg = {
        device: self.code
      };

      var method;
      var dimlevel;
      if (self.dimmable) {
        if (omsg.is_enabled() && omsg.getDim() > 0) {
          nmsg.method = "dim";
          nmsg.dimlevel = parseInt(255 * omsg.getDim() / 100);
          common.setStatus(self, 1, "Dim " + omsg.getDim() + "%");
        } else {
          nmsg.method = "turnoff";
          common.setStatus(self, -1, "Off");
        }
      } else {
        if (omsg.is_enabled() && omsg.getDim() > 0) {
          nmsg.method = "turnon";
          common.setStatus(self, 1, "On");
        } else {
          nmsg.method = "turnoff";
          common.setStatus(self, -1, "Off");
        }
      }


      //Also passing the original instruction if
      nmsg.instruction = omsg.toMessageObject();

      self.send(nmsg);
    });

  }
  RED.nodes.registerType("nrl-tellstick-out", NoreliteTellstickOutNode);
};
