const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class UserCancelTypingComposer extends MessageComposer {
  constructor() {
    super();
  }

  compose() {
    this.response.init(Outgoing.UserCancelTyping);
  }
}

module.exports = UserCancelTypingComposer;