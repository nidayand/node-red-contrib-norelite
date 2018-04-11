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

      //brightness: 255, state: 'on', color: 'ffffff'}

      var brightness = 255;
      if (self.dimmable) {
        brightness = Math.round(omsg.getDim() / 100 * 255);
      }

      nmsg.payload = {
        brightness: brightness,
        state: (!(!omsg.is_enabled() || brightness == 0) ? 'on' : 'off'),
        color: omsg.getColor().replace('#', '').toLowerCase(),
        transistiontime: 0
      };

      // Set node text
      var state = -1;
      if (!(!omsg.is_enabled() || brightness == 0))
        state = 1;
      var txt = (state == 1 ? "On" : "Off");
      if (self.dimmable && state == 1)
        txt = "Dim " + omsg.getDim() + "%";

      common.setStatus(self, state, txt);

      self.send(nmsg);
    });

  }
  RED.nodes.registerType("nrl-tradfri-out", NoreliteTradfriOutNode);
};
