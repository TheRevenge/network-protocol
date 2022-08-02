const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class UserStartTypingComposer extends MessageComposer {
  constructor() {
    super();
  }

  compose() {
    this.response.init(Outgoing.UserStartTyping);
  }
}

module.exports = UserStartTypingComposer;