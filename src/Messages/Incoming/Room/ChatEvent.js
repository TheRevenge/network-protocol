const MessageHandler = require('../MessageHandler');

class ChatEvent extends MessageHandler {
  handle() {
    if (this.client.isLoggingChat) {
      console.log(this.packet.readInt(), "said:", this.packet.readString());
    }
  }
}

module.exports = ChatEvent;