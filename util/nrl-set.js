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

    this.denabled = config.denabled;
    this.distype = config.distype;
    this.ddim = config.ddim.trim();
    this.dcolor = config.dcolor.trim();

    var self = this;

    //Set init status message
    common.setStatus(self);

    /* When a message is received */
    self.on("input", function (msg) {

      var nmsg = new Message(self, msg);

      if (nmsg.is_enabled()){
        if (Number(self.enabled) > -1)
          Number(self.enabled) == 1 ? nmsg.enable() : nmsg.disable();

        if (Number(self.istype) > -1)
          nmsg.setType(Number(self.istype));

        if (self.dim.length > 0)
          nmsg.setDim(self.dim);

        if (self.color.length > 0)
          nmsg.setColor(self.color);

      } else {
        if (Number(self.denabled) > -1)
          Number(self.denabled) == 1 ? nmsg.enable() : nmsg.disable();

        if (Number(self.distype) > -1)
          nmsg.setType(Number(self.distype));

        if (self.ddim.length > 0)
          nmsg.setDim(self.ddim);

        if (self.dcolor.length > 0)
          nmsg.setColor(self.dcolor);

      }

      common.setStatus(self, nmsg.is_enabled() ? 1 : -1, nmsg.getType() +'/'+nmsg.getDim() + '%');

      self.send(nmsg.toMessageObject());
    });
  }
  RED.nodes.registerType("nrl-set in", NoreliteSetInNode);
}
