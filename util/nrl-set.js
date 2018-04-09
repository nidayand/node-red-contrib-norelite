module.exports = function (RED) {
  "use strict";

  var common = require("../lib/common");
  var Message = require("../lib/msg");

  /*******************************************
  Value node
  ********************************************/
  function NoreliteSetInNode(config) {
    RED.nodes.createNode(this, config);
    this.slider = parseInt(config.slider);
    this.name = config.name;
    this.enabled = config.enabled;
    this.istype = config.istype;
    this.dim = config.dim.trim();
    this.color = config.color.trim();
    this.override = config.override;
    var self = this;

    //Set init status message
    common.setStatus(self);

    /* When a message is received */
    self.on("input", function (msg) {

      var nmsg = new Message(self, msg);

      if (nmsg.is_enabled() && self.override || !self.override){
        if (Number(self.enabled) > -1)
          Number(self.enabled) == 1 ? nmsg.enable() : nmsg.disable();

        if (Number(self.istype) > -1)
          nmsg.setType(Number(self.istype));

        if (self.dim.length > 0)
          nmsg.setDim(self.dim);

        if (self.color.length > 0)
          nmsg.setColor(self.color);
      }

      common.setStatus(self, nmsg.is_enabled() ? 1 : -1, nmsg.getType() +'/'+nmsg.getDim() + '%');

      self.send(nmsg.toMessageObject());
    });
  }
  RED.nodes.registerType("nrl-set in", NoreliteSetInNode);
}
