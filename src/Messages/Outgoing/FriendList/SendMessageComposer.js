const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class SendMessageComposer extends MessageComposer {
  constructor(chatId, message) {
    super();
    this.chatId = chatId;
    this.message = message;
  }

  compose() {
    this.response.init(Outgoing.SendMessage);
    this.response.appendLong(this.chatId);
    this.response.appendString(this.message);
  }
}

module.exports = SendMessageComposer;