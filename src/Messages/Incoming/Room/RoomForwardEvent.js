const MessageHandler = require('../MessageHandler');

class RoomForwardEvent extends MessageHandler {
  handle() {
    let roomId = parseInt(this.packet.readLong());
    this.client.loadRoom(roomId);
  }
}

module.exports = RoomForwardEvent;