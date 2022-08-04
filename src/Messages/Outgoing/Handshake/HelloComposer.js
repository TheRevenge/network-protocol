const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class HelloComposer extends MessageComposer {
  constructor(ivBytes, platform) {
    super();
    this.ivBytes = ivBytes;
    this.platform = platform;
  }

  compose() {
    this.response.init(Outgoing.Hello);
    this.response.appendString(this.ivBytes);
    this.response.appendString(this.platform)
    this.response.appendInt(4);
    this.response.appendInt(3);
  }
}

module.exports = HelloComposer;