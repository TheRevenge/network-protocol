const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class ShoutComposer extends MessageComposer {
    constructor(message, styleId = 0) {
        super();
        this.message = message;
        this.styleId = styleId;
      }

      compose() {
        this.response.init(Outgoing.Shout);
        this.response.appendString(this.message);
        this.response.appendInt(this.styleId);
      }
}

module.exports = ShoutComposer;