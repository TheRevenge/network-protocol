const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class ChatComposer extends MessageComposer {
  constructor(message, styleId = 0, chatTrackingId = -1) {
    super();
    this.message = message;
    this.styleId = styleId;
    this.chatTrackingId = chatTrackingId;
  }

  compose() {
    this.response.init(Outgoing.Chat);
    this.response.appendString(this.message);
    this.response.appendInt(this.styleId);
    this.response.appendInt(this.chatTrackingId);
  }
}

module.exports = ChatComposer;