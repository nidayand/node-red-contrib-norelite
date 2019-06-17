module.exports = function (RED) {
    "use strict";

    var when = require('when');
    var _ = require('underscore');
    var EventEmitter = require('events').EventEmitter;
    var common = require("../lib/common");
    var NMsg = require("../lib/msg");

    /*******************************************
    Evaluation node
    *******************************************/
    var operators = {
            'eq': function(a, b) { return a == b; },
            'neq': function(a, b) { return a != b; },
            'lt': function(a, b) { return a < b; },
            'lte': function(a, b) { return a <= b; },
            'gt': function(a, b) { return a > b; },
            'gte': function(a, b) { return a >= b; },
            'btwn': function(a, b, c) { return a >= b && a <= c; },
            'cont': function(a, b) { return (a + "").indexOf(b) != -1; },
            'regex': function(a, b) { return (a + "").match(new RegExp(b)); },
            'true': function(a) { return a === true; },
            'false': function(a) { return a === false; },
            'null': function(a) { return typeof a == "undefined"; },
            'nnull': function(a) { return typeof a != "undefined"; }
        };
    function NoreliteGate(n){
        RED.nodes.createNode(this, n);
        this.configNode = RED.nodes.getNode(n.config);
        this.rules = n.rules;
        this.checkall = (n.checkall === "true");
        this.values = []; //Keeping all the inbound messages
        this.name = n.name;

        this.srcPrefix = '[src:]';          //Identifies if a value should come from an nrl-source

        var self = this;

        self.gateopen = false;

        //Functions to work with the values store (keeps updates from the sources)
        self.valuesAdd = function(id, val){
            var found = _.findIndex(self.values, function(obj){return obj.id == id});
            if (found === -1){
                self.values.push({id : id, value: val});
            } else {
                self.values[found]= {id : id, value: val};
            }
        }
        self.valueGet = function(id){
            var found = _.find(self.values, function(obj){return obj.id == id});
            return (found != undefined ? found.value : undefined);
        }

        common.setStatus(self);

        //Initialise config
        self.configNode.initialise();

        //Tidy up to ensure correct numbers in values
        for (var i=0; i<this.rules.length; i+=1) {
            var rule = this.rules[i];

            //Copy src references to new variables
            // rule.vs and rule.v2s (s=source)
            if (typeof rule.v !== 'undefined' && rule.v.indexOf(self.srcPrefix) == 0) {
                rule.vs = rule.v.substr(self.srcPrefix.length);
                rule.v = '';
            }
            if (typeof rule.v2 !== 'undefined' && rule.v2 && rule.v2.indexOf(self.srcPrefix) == 0) {
                rule.v2s = rule.v2.substr(self.srcPrefix.length);
                rule.v2 = '';
            }

            if (typeof rule.v !== 'undefined' && !isNaN(Number(rule.v)) && !rule.vs) {
                rule.v = Number(rule.v);
            }
            if (typeof rule.v2 !== 'undefined' && !isNaN(Number(rule.v2)) && !rule.v2s) {
                rule.v2 = Number(rule.v2);
            }
        }

        //Assessment of all rules
        self.assessRules = function(){
            //Validate the rules
            var numbersTrue = 0; //Counter for number of rules that are true
            _.each(self.rules, function(rule){
                var val = self.valueGet(rule.s);
                //For non value comparison. Strictly boolean
                if (["true", "false", "null", "nnull"].includes(rule.t)) {
                    if (operators[rule.t](val)){
                        numbersTrue++;
                        common.log(self, "Rule ("+self.name+") is TRUE: "+val+" "+rule.t);
                    } else {
                        common.log(self, "Rule ("+self.name+") is FALSE: "+val+" "+rule.t);
                    }
                    return;
                }
                //Get the value to compare with
                // rule.v2 is not always available. Only used for between values
                var v = rule.vs ? self.valueGet(rule.vs) : rule.v;
                var v2 = rule.v2s ? self.valueGet(rule.v2s) : (rule.v2 ? rule.v2 : 0);
                if (val != undefined && v != undefined && v2 != undefined){
                    //Validate the rules
                    if(operators[rule.t](val,v, v2)){
                        numbersTrue++;
                        common.log(self, "Rule ("+self.name+") is TRUE: "+val+" "+rule.t+" "+v+"/"+v2);
                    } else {
                        common.log(self, "Rule ("+self.name+") is FALSE: "+val+" "+rule.t+" "+v+"/"+v2);
                    }
                }
            })

            if (numbersTrue === self.rules.length || (numbersTrue > 0 && !self.checkall)){
                self.gateopen = true;
                common.setStatus(self, 1, "Open "+numbersTrue+"/"+self.rules.length);
            } else {
                self.gateopen = false;
                common.setStatus(self, -1, "Closed "+numbersTrue+"/"+self.rules.length);
            }
        }

        //Add listeners for all sources
        when.promise(function(resolve, reject){
            var list = [];
            for (var i=0; i<self.rules.length; i++){
                list.push(self.rules[i].s);

                //Add values if sources are being used
                if (self.rules[i].vs){
                    list.push(self.rules[i].vs);
                }
                if (self.rules[i].v2s){
                    list.push(self.rules[i].v2s);
                }
            }
            if (list.length === 0){
                reject("No rules defined");
            }
            //Make the list unique
            resolve(_.uniq(list));

        }).then(function(list){
            //Setup the listener for the event to re-evaluate the rules
            _.each(list, function(id){
                self.configNode.onConfig(id, function(val){
                    //Store the value
                    self.valuesAdd(id, val);
                    common.log(self, "Source data received: "+id+" / "+val);

                    //Initialise assessment of rules
                    self.assessRules();
                });
            });
        }, function(err){
            //Something went wrong
            self.warn(err);
        });

        // Has received a new message. Send if the gate is open
        self.on("input", function(msg){
            if (self.gateopen){
                self.send([msg,null]);
            } else {
                self.send([null,msg]);
            }
        });

        //Clear timeouts
        self.on("close", function(){
            //Clear status
            common.setStatus(self);

        });

    }
    RED.nodes.registerType("nrl-gate in", NoreliteGate);
}
