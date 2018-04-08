module.exports = function (RED) {
  "use strict";
  var common = require("../lib/common");
  require("date-utils");
  var Message = require("../lib/msg");

  function NoreliteDelayNode(n) {
    RED.nodes.createNode(this, n);
    this.positive = n.positive;
    this.negative = n.negative;
    this.exptimeout;
    this.from = n.from;

    var self = this;
    common.setStatus(self);

    //Calculate timeout in millisecs
    if (n.timeoutUnits === "milliseconds") {
      self.exptimeout = n.timeout;
    } else if (n.timeoutUnits === "seconds") {
      self.exptimeout = n.timeout * 1000;
    } else if (n.timeoutUnits === "minutes") {
      self.exptimeout = n.timeout * 1000 * 60;
    } else if (n.timeoutUnits === "hours") {
      self.exptimeout = n.timeout * 1000 * 60 * 60;
    } else if (n.timeoutUnits === "days") {
      self.exptimeout = n.timeout * 1000 * 60 * 60 * 24;
    }

    self.activeMsg;
    self.queueMsg;
    self.timer;

    self.sendQueue = function () {
      //Remove timer value
      if (self.timer) {
        clearTimeout(self.timer);
      }
      self.timer = undefined;

      if (self.queueMsg){
        //Assign holding msg as the active message
        self.activeMsg = self.queueMsg;
        self.send(self.activeMsg.toMessageObject());

        //Clear status
        common.clearStatus(self);

        //Reset queue
        self.queueMsg = undefined;
      }
    }

    self.sendStateChange = function(nmsg) {
      if (self.activeMsg) {
        if (self.activeMsg.is_enabled() && self.positive) {
          if (!self.timer && !nmsg.is_enabled()) {
            //Changing from positive to negative and it is to be hold
            common.setStatus(self, 1, "On to " + new Date().addMilliseconds(self.exptimeout).toFormat("HH24:MI"));
            //Start timer On to Off
            self.timer = setTimeout(self.sendQueue, self.exptimeout);

            //Add msg to queue
            self.queueMsg = nmsg;

            //Send the active msg
            self.send(self.activeMsg.toMessageObject());
            return;
          }

          if (self.timer && nmsg.is_enabled()) {
            //Timer has started but a new positive msg has been received
            //Stop timer
            clearTimeout(self.timer);
            self.timer = undefined;
            common.clearStatus(self);

            //Clear queue
            self.queueMsg = undefined;

            //Add as activeMsg
            self.activeMsg = nmsg;

            //Send the active msg
            self.send(self.activeMsg.toMessageObject());
            return;
          }
        } else if (!self.activeMsg.is_enabled() && self.negative) {
          //Changing from negative to positive and it is to be hold
          if (!self.timer && nmsg.is_enabled()) {
            //Start timer On to Off
            common.setStatus(self, -1, "Off to " + new Date().addMilliseconds(self.exptimeout).toFormat("HH24:MI"));
            self.timer = setTimeout(self.sendQueue, self.exptimeout);

            //Add msg to queue
            self.queueMsg = nmsg;

            //Send the active msg
            self.send(self.activeMsg.toMessageObject());
            return;
          }
          //Timer has started but a new new msg has been received
          if (self.timer && !nmsg.is_enabled()) {
            //Stop timer
            clearTimeout(self.timer);
            self.timer = undefined;
            common.clearStatus(self);

            //Clear queue
            self.queueMsg = undefined;

            //Add as activeMsg
            self.activeMsg = nmsg;

            //Send the active msg
            self.send(self.activeMsg.toMessageObject());
            return;
          }
        }
      }

      //If a timer has started queue the next message
      if (self.timer) {
        self.queueMsg = nmsg;
      } else {
        common.clearStatus(self);
        self.activeMsg = nmsg;
        self.send(nmsg.toMessageObject());
      }
    }

    self.sendFromStartChange = function(nmsg) {
      if (self.activeMsg) {
        if (self.activeMsg.is_enabled() != nmsg.is_enabled()) {
          if (!self.timer && (self.positive && nmsg.is_enabled() || self.negative && !nmsg.is_enabled())) {
            //Start timer On
            common.setStatus(self, self.positive ? 1:-1, (self.positive ? "On to " : "Off to ") + new Date().addMilliseconds(self.exptimeout).toFormat("HH24:MI"));

            //Start timer to hold the value
            self.timer = setTimeout(self.sendQueue, self.exptimeout);

            //Add as activeMsg
            self.activeMsg = nmsg;

            //Send the received message
            self.send(self.activeMsg.toMessageObject());
          }

        }
      }
      //If a timer has started queue the next message
      if (self.timer) {
        self.queueMsg = nmsg;
      } else {
        common.clearStatus(self);
        self.activeMsg = nmsg;
        self.send(nmsg.toMessageObject());
      }
    }

    /* When a message is received */
    self.on("input", function (msg) {

      var nmsg = new Message(self, msg);

      if (self.from == 1) {
        //when a state change was received
        self.sendStateChange(nmsg);

      } else {
        //minimum when it changed state
        self.sendFromStartChange(nmsg);
      }
    });

    //Clear timeouts
    self.on("close", function () {
      //Stop possible delay timer
      if (self.timer) {
        clearTimeout(self.timer);
      }
    });
  }
  RED.nodes.registerType("nrl-hold in", NoreliteDelayNode);
}
