const GameEndpoints = require('./GameEndpoints');
const Network = require('./Network');

class Client extends EventTarget {
  constructor(country, ssoTicket, username) {
    super();
    this.network = new Network(this, GameEndpoints.getEndpointByCountry(country), ssoTicket);
    this.username = username;
  }

  async connect() {
    await this.network.connect();
  }

  loadRoom(roomId, password) {
    this.network.packetHandler.loadRoom(roomId, password);
  }

  sendPrivateMessage(recieverId, message) {
    this.network.packetHandler.sendPrivateMessage(recieverId, message);
  }

  followFriend(targetId) {
    this.network.packetHandler.followFriend(targetId);
  }

  leaveRoom() {
    this.network.packetHandler.leaveRoom();
  }

  sendChat(message, styleId, chatTrackingId) {
    this.network.packetHandler.sendChat(message, styleId, chatTrackingId);
  }

  sendShout(message, styleId) {
    this.network.packetHandler.sendShout(message, styleId);
  }

  moveAvatarTo(x, y) {
    this.network.packetHandler.moveTo(x, y);
  }
}

module.exports = Client;