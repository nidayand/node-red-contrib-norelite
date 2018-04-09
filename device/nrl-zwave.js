/*jslint node: true */
module.exports = function (RED) {
  "use strict";
  var common = require('../lib/common');
  var Message = require("../lib/msg");


  /*
      Defines the output node for a rule. Copied to a large extent from 66-mongodb.js
  */
  function NoreliteZwaveOutNode(config) {
    RED.nodes.createNode(this, config);
    var self = this;
    self.code = config.code;
    self.dimmable = config.dimmable;

    common.setStatus(self);

    /* When a message is received */
    self.on("input", function (msg) {
      var omsg = new Message(self, msg);

      var nmsg = {};

      if (self.dimmable) {
        if (omsg.is_enabled() && omsg.getDim() > 0) {
          //{topic: 'setLevel', payload: {"nodeid": 5, "value": 50}}
          nmsg = {
            topic: 'setLevel',
            payload: {
              "nodeid": self.code,
              "value": omsg.getDim()
            }
          };
          common.setStatus(self, 1, "Dim " + omsg.getDim() + "%");
        } else {
          //{topic: 'switchOff', payload: {"nodeid":2}}
          nmsg = {
            topic: 'switchOff',
            payload: {
              "nodeid": self.code
            }
          };
          common.setStatus(self, -1, "Off");
        }
      } else {
        if (omsg.is_enabled() && omsg.getDim() > 0) {
          //{topic: 'switchOn', payload: {"nodeid":2}}
          nmsg = {
            topic: 'switchOn',
            payload: {
              "nodeid": self.code
            }
          };
          common.setStatus(self, 1, "On");
        } else {
          //{topic: 'switchOff', payload: {"nodeid":2}}
          nmsg = {
            topic: 'switchOff',
            payload: {
              "nodeid": self.code
            }
          };
          common.setStatus(self, -1, "Off");
        }
      }


      //Also passing the original instruction if
      nmsg.instruction = omsg.toMessageObject();

      self.send(nmsg);
    });

  }
  RED.nodes.registerType("nrl-zwave-out", NoreliteZwaveOutNode);

  /* Create an API to retrieve the nodes information
  According to https://github.com/OpenZWave/node-red-contrib-openzwave/blob/master/10-zwave.js it is stored in a global variable named openzwaveNodes */
  RED.httpAdmin.get('/norelite/nrl-zwave/getzwavenodes', function (req, res) {
    if (RED.settings.functionGlobalContext.openzwaveNodes) {
      res.send(JSON.stringify(RED.settings.functionGlobalContext.openzwaveNodes));
    } else {
      res.send(JSON.stringify({}));
    }
  });
};
