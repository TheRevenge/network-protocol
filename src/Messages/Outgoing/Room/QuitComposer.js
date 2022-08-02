const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class QuitComposer extends MessageComposer {
  constructor() {
    super();
  }

  compose() {
    this.response.init(Outgoing.Quit);
  }
}

module.exports = QuitComposer;