/*jslint node: true */
module.exports = function (RED) {
  "use strict";
  var common = require('../lib/common');
  var Message = require("../lib/msg");

  function NoreliteTradfriOutNode(config) {
    RED.nodes.createNode(this, config);
    var self = this;
    self.dimmable = config.dimmable;

    common.setStatus(self);

    /* When a message is received */
    self.on("input", function (msg) {
      var omsg = new Message(self, msg);

      var nmsg = {};

      var brightness = 254;
      if (self.dimmable) {
        brightness = Math.round(omsg.getDim() / 100 * 254);
      }

      var state = -1;
      if (!(!omsg.is_enabled() || brightness == 0))
        state = 1;

      nmsg.payload = {
        brightness: (state == 1) ? brightness: 0,
        state: (state == 1) ? 'on' : 'off',
        color: omsg.getColor(),
        transistiontime: 1
      };

      // Set node text
      var txt = (state == 1 ? "On" : "Off");
      if (self.dimmable && state == 1)
        txt = "Dim " + omsg.getDim() + "%";

      common.setStatus(self, state, txt);

      self.send(nmsg);
    });

  }
  RED.nodes.registerType("nrl-tradfri-out", NoreliteTradfriOutNode);
};
