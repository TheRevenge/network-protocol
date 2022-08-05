const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class MoveComposer extends MessageComposer {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }

  compose() {
    this.response.init(Outgoing.Move);
    this.response.appendInt(parseInt(this.x));
    this.response.appendInt(parseInt(this.y));
  }
}

module.exports = MoveComposer;