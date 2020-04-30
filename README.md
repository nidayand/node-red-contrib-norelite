# node-red-contrib-norelite [![npm version](https://badge.fury.io/js/node-red-contrib-norelite.svg)](https://badge.fury.io/js/node-red-contrib-norelite)
A set of Node-RED nodes to ease the implementation of your home automation requirements.
The package is the successor to the npm package [**norelite**](https://www.npmjs.com/package/norelite). The package/repo was changed due to a major restructuring and changes to the code base as well as the interaction format between the nodes has changed.
## Install
```bash
cd ~/.node-red
npm install node-red-contrib-norelite
```
**Additional nodes** that can be used with **node-red-contrib-norelite** can be found here:
- [node-red-contrib-norelite-color](https://www.npmjs.com/package/node-red-contrib-norelite-color) : To change the color instruction in a message. Uses [jscolor lib](http://jscolor.com/) that is under [GNU GPL license v3](http://www.gnu.org/licenses/gpl-3.0.txt)
- [node-red-contrib-norelite-homeassistant](https://www.npmjs.com/package/node-red-contrib-norelite-homeassistant) : Helper nodes to be used with **node-red-contrib-norelite**  and [node-red-contrib-norelite-home-assistant-websocket](https://www.npmjs.com/package/node-red-contrib-home-assistant-websocket). Translates instructions that are compliant for calls to your Home Assistant instance

## Get started
I know, there are many nodes and reading the documentation is not that fun. Start by taking a look at the exmples that you get when you install the bundle. Examples are available through the Node-RED UI at **Import -> Examples**

## What is it?
Simplified, **node-red-contrib-norelite** is a set of Node-RED nodes that are designed to managed your simple and complex rules that controls your IoT enabled devices. It includes plenty of nodes to manage incoming values, create rules based on the values, utilities to change the instructions and and some device nodes to convert the instructions into a message that can be understood by the transmitting node that finally will transmit the instruction to your IoT device such as a lamp or power switch.

The simplest flow of events is:
1. Store an incoming value in a **source node**
2. A rule will compare the value in a **rule node**
4. A **device node** converts the internal messaging format to an instruction that can be understood by the transmitting node. E.g. Tellstick (node-red-contrib-tellstick), Z-wave (node-red-contrib-openzwave), rfxcom (node-red-contrib-rfxcom) or any custom node as the messaging format is simple.

But there is much more to it... and the nodes should be well described in the node descriptions.


## Basic structure and order ##
1. Collect data - use nrl-source to store the data to be used by the nrl-eval nodes
2. Define action flows
    1. Evaluate rules - use nrl-eval or nrl-on to start a new flow
    2. Apply filters - use utility nodes
    3. Calculate final instruction - use nrl-switch that can take multiple inputs
    4. Convert the instruction for the device that is to be controlled - use device nodes
    5. Connect to transmitting nodes or go through nrl-limit to limit the load on the transmitting node (e.g. node-red-contrib-tellstick)

### The nodes are divided into 3 categories ###
**( * )**: Message in/out should support the messaging format as per below
- **Core**
    - `nrl-source`: Stores incoming values. Stateful
    - `nrl-eval`: Evalutes the values and generates a message. Stateful (*)
    - `nrl-limit`: Can be used to intelligently limit load on the transmitting node. Input should come from a **Device node** as the messaging format is unique for this node
    - `nrl-on`: Always send on **turn on** instruction. Stateful (*)
    - `nrl-switch`: Takes multiple inputs, session persistent storage of the messages, calculates the outbound message and onsly sends an instruction if the result has changed. Stateful (*)
- **Util**
    - `nrl-dayslimit`: Filters based on weekday (*)
    - `nrl-timelimit`: Filters based on time of day (*)
    - `nrl-hold`: Hold the state for a defined time (*)
    - `nrl-set`: Overrides the incoming values (*)
    - `nrl-value`: Changes the dim value (*)
    - `nrl-gate`: Routes message based on rules (2 outputs). Similar to nrl-eval but is stateless and the inbound message can be of any format
    - `nrl-route`: Routes message based on msg.payload.enabled (2 outputs). See messaging format below. (*)
    - (`nrl-color` is found in [node-red-contrib-norelite-color](https://www.npmjs.com/package/node-red-contrib-norelite-color) package): Changes the color value in HEX (*)
- **Device**
     - `nrl-tradfri`: Converts to a message compatible with [node-red-contrib-tradfri](https://www.npmjs.com/package/node-red-contrib-tradfri) (*)
    - `nrl-tellstick`: Converts to a message compatible with [node-red-contrib-tellstick](https://www.npmjs.com/package/node-red-contrib-tellstick) (*)
    - `nrl-rfxcom`: Converts to a message compatible with [node-red-contrib-rfxcom](https://www.npmjs.com/package/node-red-contrib-rfxcom) (*)
    - `nrl-zwave`: Converts to a message compatible with [node-red-contrib-openzwave](https://www.npmjs.com/package/node-red-contrib-openzwave) (*)
    - `nrl-tradfri`: Converts to a message compatible with [node-red-contrib-tradfri](https://www.npmjs.com/package/node-red-contrib-tradfri) (*)

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

## Examples
Look in the examples folder