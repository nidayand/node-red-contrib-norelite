module.exports = function (RED) {
  "use strict";

  /*******************************************
  Value node
  ********************************************/
  function NoreliteRouteNode(config) {
    RED.nodes.createNode(this, config);
    var self = this;

    /* When a message is received */
    self.on("input", function (msg) {
      if (msg.payload.enabled){
        self.send([msg, null]);
      } else {
        self.send([null, msg]);
      }
    });
  }
  RED.nodes.registerType("nrl-route in", NoreliteRouteNode);
}
