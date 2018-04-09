module.exports = function (RED) {
  "use strict";

  var when = require('when');
  var _ = require('underscore');
  var EventEmitter = require('events').EventEmitter;
  var common = require("../lib/common");
  var Message = require("../lib/msg");

  /*******************************************
  Switch node and config
  *******************************************/
  function NoreliteSwitchConfig(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.times = n.times;
  }
  RED.nodes.registerType("nrl-switch-config", NoreliteSwitchConfig);

  function NoreliteSwitch(n) {
    RED.nodes.createNode(this, n);
    this.times = RED.nodes.getNode(n.times).times;
    this.name = n.name;
    this.timer = null;
    var self = this;

    //timeout
    if (n.repeatUnits === "milliseconds") {
      this.repeat = n.repeat;
    } else if (n.repeatUnits === "seconds") {
      this.repeat = n.repeat * 1000;
    } else if (n.repeatUnits === "minutes") {
      this.repeat = n.repeat * 1000 * 60;
    } else if (n.repeatUnits === "hours") {
      this.repeat = n.repeat * 1000 * 60 * 60;
    } else if (n.repeatUnits === "days") {
      this.repeat = n.repeat * 1000 * 60 * 60 * 24;
    }
    //Set init status message
    common.setStatus(self);

    /* Holds messages from all different linkIds
    Sturcture of incoming messages
    { lid: xyz, status: 0/1, value:0-100, type: "rule"/"scenario"/"direct"}
    */
    self.allIds = []; //Keeps a list of all nmsgs
    //Functions to work with the values store (keeps updates from the sources)
    self.allIdsAdd = function (nmsg) {
      var found = _.findIndex(self.allIds, function (obj) {
        return obj.id == nmsg.id
      });
      if (found === -1) {
        self.allIds.push(nmsg);
      } else {
        self.allIds[found] = nmsg;
      }
    }
    self.activeId; //Keeps the active id of receiving message
    self.prevMsg; //Keeps store of the last sent out msg


    /* Method to create output message */
    //Validate function of what the output msg should look like
    self.getOutputMsg = function () {
      var sendit = false;

      //Set an empty output message
      var out_msg = new Message(self);
      out_msg.reset(true); //Reset to negative values

      _.each(self.allIds, function (cid) {
        if (cid.getType() > out_msg.getType()) {

          //If the type is higher copy all content to output msg
          out_msg.copy(cid);
          self.activeId = cid.getId();

        } else if (cid.getType() == out_msg.getType()) {
          /* Always use the higest value of dim and if it is
          higher set the color to the same */

          if (cid.getDim() > out_msg.getDim()) {
            out_msg.setDim(cid.getDim());
            out_msg.setColor(cid.getColor());
            self.activeId = cid.getId();
          }
        } //if rule
      }); //each
      return out_msg;
    } //getOutputMsg

    /* Send the message */

    self.sendMsg = function (repeatCall=false) {
      //Retrieves a new active message
      //self.activeId is set in the method
      var msg = self.getOutputMsg();

      if (typeof self.prevMsg == 'undefined' ||
        /* Variables have changed */
        !self.prevMsg.compareTo(msg) ||
        /* It is a repeat message */
        repeatCall) {

        //Clear timer
        if (self.timer) {
          clearTimeout(self.timer);
          self.timer = null;
        }


        //Send the message the set number of times
        for (var i = 0; i < self.times; i++) {
          self.send(msg.toMessageObject());
        }

        //Set timer for repeat function
        self.timer = setTimeout(function () {
          self.sendMsg(true)
        }, self.repeat);

        //Save current message for review next time the method is called
        self.prevMsg = msg;
      }

      //Set status message
      var state = 1;
      if (!msg.is_enabled() || msg.getDim() === 0) {
        state = -1;
      }
      common.setStatus(self, state, (msg.getType() == -1 ? "Inactive" : msg.getType()) + "/" + msg.getDim() + "%");
    }


    /* On received messages */
    self.receiveTimeout;
    self.on("input", function (msg) {
      //Add to local array used for validation on out message
      var m = new Message(self, msg, false);
      self.allIdsAdd(m);

      /* Set a small delay to prevent unnecessary processing before actually all messages
      have been received. E.g. when starting for the first time */
      if (self.receiveTimeout) {
        clearTimeout(self.receiveTimeout);
        self.receiveTimeout = null;
      }
      self.receiveTimeout = setTimeout(function () {
        self.sendMsg();
      }, 1000);

    });

    /* When a node is closed */
    self.on("close", function () {
      //Clear the repeat timer
      if (self.timer) {
        clearTimeout(self.timer);
        self.timer = null;
      }
      //Clear the receive timeout
      if (self.receiveTimeout) {
        clearTimeout(self.receiveTimeout);
        self.receiveTimeout = null;
      }
      //Reset holder of all incoming msgs and msg values
      self.allIds = [];
      self.activeId = null;
      self.prevMsg = null;

      //Reset the status
      common.setStatus(self);

    });

  }
  RED.nodes.registerType("nrl-switch out", NoreliteSwitch);
}
