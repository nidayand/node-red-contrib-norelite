# node-red-contrib-norelite [![npm version](https://badge.fury.io/js/node-red-contrib-norelite.svg)](https://badge.fury.io/js/node-red-contrib-norelite)
A set of Node-RED nodes to ease the implementation of your home automation requirements by using visual rules to manage the state your devices.
## Install
```bash
cd ~/.node-red
npm install @nidayand/node-red-contrib-norelite
```
**Additional nodes** that can be used with **node-red-contrib-norelite** can be found here:
- [node-red-contrib-norelite-color](https://www.npmjs.com/package/node-red-contrib-norelite-color) : To change the color instruction in a message. Uses [jscolor lib](http://jscolor.com/) that is under [GNU GPL license v3](http://www.gnu.org/licenses/gpl-3.0.txt)
- [node-red-contrib-norelite-devices](https://www.npmjs.com/package/node-red-contrib-norelite-devices) : A set of helper nodes message conversion to other libraries for device integration (deprecated - used to be part of this library) 

## Get started
I know, there are many nodes and reading the documentation is not that fun. Start by taking a look at the exmples that you get when you install the bundle. Examples are available through the Node-RED UI at **Import -> Examples**

## What is it?
Simplified, **node-red-contrib-norelite** is a set of Node-RED nodes that are designed to managed your simple and complex rules that controls your smart devices. It includes plenty of nodes to manage incoming values, create rules based on the values, utilities to change the instructions and and some device nodes to convert the instructions into a message that can be understood by the transmitting node that finally will transmit the instruction to your IoT device such as a lamp or power switch.

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
- **Core nodes**
    - `nrl-config`: Configuration node that holds global settings and an EventEmitter used to publish source updates to evaluation nodes.
    - `nrl-source`: Source node that accepts input values and publishes them to subscribed evaluation nodes via the config emitter. Features: expiration (expire value), hysteresis, default value, toggle and cycle modes, optional output, and optional saving of the last value to flow context.
    - `nrl-eval`: Rule evaluation node. Subscribes to configured sources (via the config emitter), evaluates rules (eq, neq, lt, gt, btwn, cont, regex, true/false/null checks), and emits enabled/disabled instruction messages. Supports input-based base payloads, repeat timers and delayed output.
    - `nrl-on`: Simple periodic/keep-alive node that sends an initial message shortly after start and repeats every minute.
    - `nrl-limit`: Rate-limiter/delay node that throttles messages according to configured rate units (milliseconds/seconds/minutes/hours/days) and buffers excess messages.
    - `nrl-switch`: Aggregator/selector node that collects incoming instruction messages, resolves the highest-priority/brightest enabled instruction and outputs it. Provides a second output with the list of all incoming IDs and supports periodic repeat of the active instruction.
- **Utility nodes**
    - `nrl-dayslimit`: Passes messages only on selected weekdays (Mon-Sun). Disables messages on non-selected days.
    - `nrl-gate`: Rule-based gate. Evaluates rules like `nrl-eval` but keeps an internal gate state (open/closed); routes incoming messages to output A when open and output B when closed.
    - `nrl-hold` (hold/delay): Holds state changes for a configured timeout before switching; supports positive/negative hold behavior, queuing and time-based release.
    - `nrl-route`: Simple router that forwards enabled messages to the first output and disabled messages to the second output.
    - `nrl-set`: Prepares or overrides instruction properties (enabled, priority/type, dim, color) based on configuration and incoming message state; used to create properly formatted instruction messages.
    - `nrl-timelimit`: Allows messages only within a configured time range (FROM/TO); disables messages outside the range.
    - `nrl-value`: Outputs an instruction with a fixed dim value (slider) — convenient value node for setting brightness.
- **Home Assistant helper nodes**
    - `light-out` (lights-out): Converts internal instruction messages to Home Assistant service call payloads for lights. Sets `service` (`turn_on`, `turn_off` or `toggle`), `data` with `rgb_color`, `brightness` (0–255) and `transition`, and includes the original `instruction` in the outbound message.
    - `switch-out`: Converts internal instruction messages to Home Assistant service call payloads for switches. Chooses `turn_on`, `turn_off` or `toggle` and includes the original `instruction` in the outbound message.


## Messaging format
Between the Node-RED nodes the following messages will be sent (with the exception from the device nodes and limit node):
```javascript
msg.payload = {
    id : '31728023.39c83',  //the node.id of the sending node
    enabled: true,          //is the message instruction active (on/off)
    priority: 0,                //prioritization value (used by the switch node). Default '0'
    dim: 100,               //dim value 0-100
    color: '#FFFFFF'        //for use of color enabled devices
}
```
**id** is sypically generated by the sending node (node-id) and is used by the **switch** node that keeps a record of all incoming messages and from where it was sent in order to calculate the outbound message from the node.

## Examples
Look in the examples folder