module.exports = function (RED) {
  "use strict";

  var when = require('when');
  var _ = require('underscore');
  var common = require("../lib/common");
  var Message = require("../lib/msg");

  /*******************************************
  Days limit node
  ********************************************/
  function NoreliteDaysLimitInNode(config) {
    RED.nodes.createNode(this, config);
    var self = this;
    self.mon = config.mon;
    self.tue = config.tue;
    self.wed = config.wed;
    self.thu = config.thu;
    self.fri = config.fri;
    self.sat = config.sat;
    self.sun = config.sun;

    common.setStatus(self);

    self.on("input", function (msg) {

      var nmsg = new Message(self, msg);

      var valid = false;
      switch (new Date().getDay()) {
        case 0:
          valid = self.sun;
          break;
        case 1:
          valid = self.mon;
          break;
        case 2:
          valid = self.tue;
          break;
        case 3:
          valid = self.wed;
          break;
        case 4:
          valid = self.thu;
          break;
        case 5:
          valid = self.fri;
          break;
        case 6:
          valid = self.sat;
          break;
      }
      if (!valid) {
        nmsg.disable();
        common.setStatus(self, -1, "Inactive");
      } else {
        common.setStatus(self, nmsg.is_enabled() ? 1: 0, "Active");
      }
      self.send(nmsg.toMessageObject());
    });


    self.on("close", function () {
      common.setStatus(self);
    });
  }
  RED.nodes.registerType("nrl-dayslimit in", NoreliteDaysLimitInNode);
}
