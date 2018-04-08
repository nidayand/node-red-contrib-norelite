module.exports = function (RED) {
  "use strict";

  var when = require('when');
  var _ = require('underscore');
  var common = require("../lib/common");
  var Message = require("../lib/msg");

  /*******************************************
    Time limit node
    ********************************************/
  function NoreliteTimeLimitInNode(config) {
    RED.nodes.createNode(this, config);
    var self = this;
    self.from = config.from;
    self.to = config.to;

    /* Validate if node is ok. Copied validation
    from HTML-file */
    var validate = function (v) {
      if (v.indexOf(":") == -1) {
        return false;
      }
      var tarr = v.split(":");
      if (tarr.length != 2) {
        return false;
      }
      var h = parseInt(tarr[0]);
      if (isNaN(h) || h < 0 || h > 23) {
        return false;
      }
      var m = parseInt(tarr[1]);
      if (isNaN(m) || m < 0 || m > 59) {
        return false;
      }
      return true;
    };

    var getTimeObject = function (v) {
      var tarr = v.split(":");
      return {
        hours: parseInt(tarr[0]),
        mins: parseInt(tarr[1]),
        totSecs: (parseInt(tarr[0]) * 3600 + parseInt(tarr[1]) * 60)
      };
    }

    //Are both valid?
    self.valid = validate(self.from) && validate(self.to);

    if (!self.valid) {
      if (!validate(self.from)) {
        self.warn("FROM field (time limit) has an invalid entry");
      }
      if (!validate(self.to)) {
        self.warn("TO field (time limit) has an invalid entry");
      }
      common.setStatus(self, -1, "Invalid defintion");
      self.error("Cannot proceed due to invalid input");
    }
    common.setStatus(self);

    /* Get the hours and minutes */
    self.from = getTimeObject(self.from);
    self.to = getTimeObject(self.to);

    /* When a message is received */
    self.on("input", function (msg) {
      var nmsg = new Message(self, msg);

      var now = new Date();
      var nowTotSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      if (self.from.totSecs < self.to.totSecs) {
        //From < To (both on same day)

        if (self.from.totSecs < nowTotSecs && nowTotSecs < self.to.totSecs) {
          //Never set. Only reset
          common.setStatus(self, nmsg.is_enabled() ? 1 : 0, "Active");
        } else {
          nmsg.disable();
          common.setStatus(self, -1, "Inactive");
        }

      } else {
        if ((self.from.totSecs < nowTotSecs) || nowTotSecs < self.to.totSecs) {
          //Never set. Only reset
          common.setStatus(self, nmsg.is_enabled() ? 1 : 0, "Active");
        } else {
          nmsg.disable();
          common.setStatus(self, -1, "Inactive");
        }
      }

      self.send(nmsg.toMessageObject());
    });

    self.on("close", function () {
      common.setStatus(self);
    });
  }
  RED.nodes.registerType("nrl-timelimit in", NoreliteTimeLimitInNode);
}
