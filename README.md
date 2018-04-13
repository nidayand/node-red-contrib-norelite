# node-red-contrib-norelite [![npm version](https://badge.fury.io/js/node-red-contrib-norelite.svg)](https://badge.fury.io/js/node-red-contrib-norelite)
A set of Node-RED nodes to ease the implementation of your home automation requirements. 
The package is the successor to the npm package [**norelite**](https://www.npmjs.com/package/norelite). The package/repo was changed due to a major restructuring and changes to the code base as well as the interaction format between the nodes has changed. 
## Install
```bash
cd ~/.node-red
npm install node-red-contrib-norelite
```
**Additional nodes** that can be used with **node-red-contrib-norelite** but due to licensing restrictions is not part of this repo can be found here:
- [node-red-contrib-norelite-color](https://www.npmjs.com/package/node-red-contrib-norelite-color) : To change the color instruction in a message. Uses [jscolor lib](http://jscolor.com/) that is under [GNU GPL license v3](http://www.gnu.org/licenses/gpl-3.0.txt)

## What is it?
Simplified, **node-red-contrib-norelite** is a set of Node-RED nodes that are designed to managed your simple and complex rules that controls your IoT enabled devices. It includes plenty of nodes to manage incoming values, create rules based on the values, utilities to change the instructions and and some device nodes to convert the instructions into a message that can be understood by the transmitting node that finally will transmit the instruction to your IoT device such as a lamp or power switch.

The simplest flow of events is:
1. Store an incoming value in a **source node**
2. A rule will compare the value in a **rule node**
4. A **device node** converts the internal messaging format to an instruction that can be understood by the transmitting node. E.g. Tellstick (node-red-contrib-tellstick), Z-wave (node-red-contrib-openzwave), rfxcom (node-red-contrib-rfxcom) or any custom node as the messaging format is simple.

But there is much more to it... and the nodes should be well described in the node descriptions.

The nodes are divided into 3 categories:
- **Core**
    - `nrl-source`: Stores incoming values
    - `nrl-eval`: Evalutes the values
    - `nrl-limit`: Can be used to intelligently limit load on the transmitting node
    - `nrl-on`: Always send on **turn on** instruction
    - `nrl-switch`: Takes multiple inputs, session persistent storage of the messages, calculates the outbound message and onsly sends an instruction if the result has changed
- **Util**
    - `nrl-dayslimit`: Filters based on weekday
    - `nrl-timelimit`: Filters based on time of day
    - `nrl-hold`: Hold the state for a defined time
    - `nrl-set`: Overrides the incoming values
    - `nrl-value`: Changes the dim value
    - (`nrl-color` is found in [node-red-contrib-norelite-color](https://www.npmjs.com/package/node-red-contrib-norelite-color) package): Changes the color value in HEX
- **Device**
     - `nrl-tradfri`: Converts to a message compatible with [node-red-contrib-tradfri](https://www.npmjs.com/package/node-red-contrib-tradfri)
    - `nrl-tellstick`: Converts to a message compatible with [node-red-contrib-tellstick](https://www.npmjs.com/package/node-red-contrib-tellstick)
    - `nrl-rfxcom`: Converts to a message compatible with [node-red-contrib-rfxcom](https://www.npmjs.com/package/node-red-contrib-rfxcom)
    - `nrl-zwave`: Converts to a message compatible with [node-red-contrib-openzwave](https://www.npmjs.com/package/node-red-contrib-openzwave)

Let me know if you have created more nodes that I can add to this list.

## Messaging format
Between the Node-RED nodes the following messages will be sent (with the exception from the device nodes and limit node):
```javascript
msg.payload = {
    id : '31728023.39c83',  //the node.id of the sending node
    enabled: true,          //is the message instruction active (on/off)
    type: 0,                //prioritization value (used by the switch node). Default '0'
    dim: 100,               //dim value 0-100
    color: '#FFFFFF'        //for use of color enabled devices
}
```
**id** is used for the **switch** node that keeps a record of all incoming messages and from where it was sent in order to calculate the outbound message from the node.

## Example
```json
[{"id":"462b78a4.2ca368","type":"inject","z":"47b8458c.4eb8ec","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":200,"wires":[["395a09c8.181916"]]},{"id":"395a09c8.181916","type":"nrl-source out","z":"47b8458c.4eb8ec","config":"db8f9191.d5a94","uid":"a2cfb921-87cc-4578-66ce-9ddce644947d","name":"toggle","def":"0","expire":false,"timeout":100,"timeoutUnits":"seconds","expval":"false","output":false,"hysteresis":0,"toggle":true,"outputs":0,"x":350,"y":200,"wires":[]},{"id":"2e275534.39c7fa","type":"nrl-eval in","z":"47b8458c.4eb8ec","config":"db8f9191.d5a94","name":"toggle + random","rules":[{"s":"a2cfb921-87cc-4578-66ce-9ddce644947d","t":"eq","v":"1"},{"s":"228cb108-203f-48c6-a413-603fd136ec6f","t":"gt","v":"0.5"}],"checkall":"true","inputson":false,"outputdelay":true,"inputs":0,"x":180,"y":460,"wires":[["3cd63014.53646"]]},{"id":"3c1c2521.3987ba","type":"nrl-rfxcom-out","z":"47b8458c.4eb8ec","name":"rfx enabled switch","code":"ABC/123","dimmable":false,"x":690,"y":460,"wires":[["82a8d9a3.52eac8"]]},{"id":"82a8d9a3.52eac8","type":"debug","z":"47b8458c.4eb8ec","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":930,"y":460,"wires":[]},{"id":"5df1ea3d.c8a384","type":"inject","z":"47b8458c.4eb8ec","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":260,"wires":[["793aa07a.74a72"]]},{"id":"793aa07a.74a72","type":"function","z":"47b8458c.4eb8ec","name":"Math.random()","func":"msg.payload = Math.random();\nreturn msg;","outputs":1,"noerr":0,"x":370,"y":260,"wires":[["d18a9fdf.d4a42"]]},{"id":"d18a9fdf.d4a42","type":"nrl-source out","z":"47b8458c.4eb8ec","config":"db8f9191.d5a94","uid":"228cb108-203f-48c6-a413-603fd136ec6f","name":"random","def":"0","expire":false,"timeout":100,"timeoutUnits":"seconds","expval":"false","output":false,"hysteresis":0,"toggle":false,"outputs":0,"x":560,"y":260,"wires":[]},{"id":"b2797391.24b51","type":"inject","z":"47b8458c.4eb8ec","name":"","topic":"","payload":"","payloadType":"date","repeat":"10","crontab":"","once":false,"onceDelay":0.1,"x":170,"y":320,"wires":[["6518f971.91c858"]]},{"id":"6518f971.91c858","type":"nrl-source out","z":"47b8458c.4eb8ec","config":"db8f9191.d5a94","uid":"3c27fa1c-5fe4-44be-b81a-69f37d64836f","name":"toggle 2","def":"0","expire":false,"timeout":100,"timeoutUnits":"seconds","expval":"false","output":false,"hysteresis":0,"toggle":true,"outputs":0,"x":360,"y":320,"wires":[]},{"id":"3cd63014.53646","type":"nrl-switch out","z":"47b8458c.4eb8ec","name":"calc","times":"8633f227.fa909","repeat":10,"repeatUnits":"minutes","x":370,"y":460,"wires":[["3c1c2521.3987ba"]]},{"id":"4ebb4cdb.2dfc94","type":"nrl-eval in","z":"47b8458c.4eb8ec","config":"db8f9191.d5a94","name":"Toggle2 On","rules":[{"s":"3c27fa1c-5fe4-44be-b81a-69f37d64836f","t":"eq","v":"1"}],"checkall":"true","inputson":false,"outputdelay":true,"inputs":0,"x":170,"y":520,"wires":[["3cd63014.53646"]]},{"id":"b3e24bd2.da5ab8","type":"comment","z":"47b8458c.4eb8ec","name":"Store some sources","info":"","x":180,"y":160,"wires":[]},{"id":"fdc83bfe.8ee608","type":"comment","z":"47b8458c.4eb8ec","name":"Define rules","info":"","x":170,"y":420,"wires":[]},{"id":"d1f87902.fe5808","type":"comment","z":"47b8458c.4eb8ec","name":"Calculate instruction on several rules","info":"","x":420,"y":420,"wires":[]},{"id":"f818642e.b87438","type":"comment","z":"47b8458c.4eb8ec","name":"Convert to rfxcom instruction","info":"","x":720,"y":420,"wires":[]},{"id":"998bc2c3.1f794","type":"comment","z":"47b8458c.4eb8ec","name":"Simulate transmitting node","info":"","x":990,"y":420,"wires":[]},{"id":"db8f9191.d5a94","type":"nrl-config","z":"","delay":"5","name":""},{"id":"8633f227.fa909","type":"nrl-switch-config","z":"","times":"1","name":""}]
```
