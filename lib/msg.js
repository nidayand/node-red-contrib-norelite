'use strict';

class Message {
  constructor(node, msg = null, retainId = true) {

    /*
    id defines the node that sent the message and can be used by some nodes that has several inputs
    to assess how a device should be managed.
    Whenever an node sends a message it needs to update with a unique value that can identify, by the
    receiving node, from where a message was sent
    */
    this.id = node.id;

    /*
    enabled defines if a message should be used in the assessemnents in the flow or simply
    be discared.
    */
    this.enabled = true;

    /*
    type defines how a message should be treated.
    0 = evaluate using rules
    1 = will override rules in priority. E.g. a rule output can say that a device should be turned on 100%
        and an override can say turn it off - i.e. 0% in output
    */
    this.type = 0;

    /*
    dim defines the dim value of a device and a valid value is between 0-100
    */
    this.dim = 100;

    /*
    color defines the output color of a device that should be controlled
    */
    this.color = "#FFFFFF";

    if (msg != null) {
      this.fromMessageObject(msg, retainId);
    }
  }

  /**
   * Converts a message object into an instance
   * of this class
   * @author nidayand
   * @param {object} obj msg in Node-Red
   * @param {boolean} obj Keep id from original class instance (default true)
   */
  fromMessageObject(msg, retainId = true) {
    if (!retainId)
      this.id = msg.payload.id;
    this.enabled = msg.payload.enabled;
    this.type = msg.payload.type;
    this.dim = msg.payload.dim;
    this.color = msg.payload.color;
  }

  /**
   * Outputs an object that can be used when sending through the
   * nodes that are not aware of this Message class
   * @author nidayand
   * @param {object} obj msg in Node-Red
   * @returns {object} Version of the message
   */
  toMessageObject(msg) {
    if (typeof msg == 'undefined')
      msg = {
        topic: ''
      };
    msg.payload = {
      id: this.id,
      enabled: this.enabled,
      type: this.type,
      dim: this.dim,
      color: this.color
    };
    return msg;
  }

  /**
   * Copy variables from another instance of this class
   * @author nidayand
   * @param {Message} obj Another instance of this class
   */
  copy(obj) {
    var p = JSON.parse(JSON.stringify(obj));
    this.enabled = p.enabled;
    this.type = p.type;
    this.dim = p.dim;
    this.color = p.color;
  }


  /**
   * Enables the instruction and should be interpreted
   * by receiving nodes. It is important the the message
   * is sent as a previous state can be kept by
   * the receiving node.y
   * @author nidayand
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disabled the isntruction. It should be discarded by
   * receiving nodes.  It is important the the message
   * is sent as a previous state can be kept by
   * the receiving node.
   * @author nidayand
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Setting default values in message
   * @author nidayand
   */
  reset(negative = false) {
    if (!negative) {
      this.enabled = true;
      this.type = 0;
      this.dim = 100;
      this.color = "#FFFFFF";
    } else {
      this.enabled = false;
      this.type = -1;
      this.dim = 0;
      this.color = "#FFFFFF";
    }
  }


  /**
   * Is the instruction enabled?
   * @author nidayand
   * @returns {boolean} Is the message/instruction enabled?
   */
  is_enabled() {
    return this.enabled;
  }

  /**
   * Updates the message id with the sending node identifier. The identifier
   * is custom as it needs to be kept when creating a new node and copy
   * @author nidayand
   * @param {object} node By the node setting sets the sending node id
   */
  setId(node) {
    this.id = node.id;
  }

  /**
   * Get the id
   * @author nidayand
   * @returns {string} ID value
   */
  getId() {
    return this.id;
  }


  /**
   * Sets the new dim value
   * @author nidayand
   * @param {number} val Dim value
   */
  setDim(val) {
    this.dim = val;
  }

  /**
   * Get dim value set in message
   * @author nidayand
   * @returns {number} Returns the 0-100 value set
   */
  getDim() {
    return this.dim;
  }

  /**
   * Sets the type
   * @author nidayand
   * @param {number} val New integer value
   */
  setType(val) {
    this.type = val;
  }
  /**
   * Get teǵe type
   * @author nidayand
   * @returns {number} Type value
   */
  getType() {
    return this.type;
  }

  /**
   * Set color
   * @author nidayand
   * @param {string} hex Hex color value
   */
  setColor(hex) {
    this.color = hex;
  }
  /**
   * Retrieves the color setting
   * @author nidayand
   * @returns {string} Hex color value
   */
  getColor() {
    return this.color;
  }

  /**
   * Compares values except for type. I.e. enabled, dim, color
   * @author nidayand
   * @param   {object}  obj Message object to compare with
   * @returns {boolean} Returns true if the values are the same
   */
  compareTo(obj) {
    if (this.is_enabled() != obj.is_enabled() || this.getDim() != obj.getDim() || this.getColor() != obj.getColor()) {
      return false;
    } else {
      return true;
    }
  }

}

module.exports = Message;
