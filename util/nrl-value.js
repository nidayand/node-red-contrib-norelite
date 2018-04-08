module.exports = function (RED) {
  "use strict";

  var when = require('when');
  var _ = require('underscore');
  var common = require("../lib/common");
  var Message = require("../lib/msg");

  /*******************************************
  Value node
  ********************************************/
  function NoreliteValueOutNode(config) {
    RED.nodes.createNode(this, config);
    this.slider = parseInt(config.slider);
    var self = this;

    /* When a message is received */
    self.on("input", function (msg) {

      var nmsg = new Message(self, msg);

      nmsg.setDim(self.slider);
      self.send(nmsg.toMessageObject());
    });
  }
  RED.nodes.registerType("nrl-value in", NoreliteValueOutNode);
}
