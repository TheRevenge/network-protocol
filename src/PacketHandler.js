const reverse = require('buffer-reverse');

const ServerMessage = require('./Messages/ServerMessage');
const Incoming = require('./Messages/Incoming/Incoming').getInstance();
const Outgoing = require('./Messages/Outgoing/Outgoing').getInstance();

const ChatComposer = require('./Messages/Outgoing/Room/ChatComposer');
const HelloComposer = require('./Messages/Outgoing/Handshake/HelloComposer');
const InitDhHandshakeComposer = require('./Messages/Outgoing/Handshake/InitDhHandshakeComposer');
const GetGuestRoomComposer = require('./Messages/Outgoing/Room/GetGuestRoomComposer');
const FlatOpcComposer = require('./Messages/Outgoing/Room/FlatOpcComposer');
const FollowFriendComposer = require("./Messages/Outgoing/FriendList/FollowFriendComposer");
const QuitComposer = require('./Messages/Outgoing/Room/QuitComposer');
const SendMessageComposer = require("./Messages/Outgoing/FriendList/SendMessageComposer");
const ShoutComposer = require('./Messages/Outgoing/Room/ShoutComposer');
const UserStartTypingComposer = require('./Messages/Outgoing/Room/UserStartTypingComposer');
const UserCancelTypingComposer = require('./Messages/Outgoing/Room/UserCancelTypingComposer');

const DhInitHandshakeEvent = require('./Messages/Incoming/Handshake/DhInitHandshakeEvent');
const DhCompleteHandshakeEvent = require('./Messages/Incoming/Handshake/DhCompleteHandshakeEvent');
const MessengerNewConsoleMessageEvent = require("./Messages/Incoming/FriendList/MessengerNewConsoleMessageEvent");
const OkEvent = require('./Messages/Incoming/Handshake/OkEvent');
const PingEvent = require('./Messages/Incoming/Misc/PingEvent');
const RoomForwardEvent = require('./Messages/Incoming/Room/RoomForwardEvent');
const RoomReadyEvent = require('./Messages/Incoming/Room/RoomReadyEvent');


class PacketHandler {
  constructor(network) {
    this.network = network;
    this.handlers = [];
  }

  registerPackets() {
    this.registerPacket(Incoming.DhInitHandshake, DhInitHandshakeEvent);
    this.registerPacket(Incoming.DhCompleteHandshake, DhCompleteHandshakeEvent);
    this.registerPacket(Incoming.Ping, PingEvent);
    this.registerPacket(Incoming.Ok, OkEvent);
    this.registerPacket(Incoming.RoomReady, RoomReadyEvent);
    this.registerPacket(Incoming.MessengerNewConsoleMessage, MessengerNewConsoleMessageEvent);
    this.registerPacket(Incoming.RoomForward, RoomForwardEvent);
  }

  registerPacket(header, handler) {
    this.handlers[header] = handler;
  }

  onDataReceive(buffer) {
    let countPackets = 0;
    let maxPackets = 50;

    if (this.buffer) {
      buffer = Buffer.concat([this.buffer, buffer]);
      this.buffer = null;
    }

    while (buffer.length > 3) {
      if (countPackets++ >= maxPackets) {
        return packets;
      }

      let length = buffer.readInt32BE(0) + 4;

      if (length > buffer.length) {
        if (this.buffer) {
          this.buffer = Buffer.concat([this.buffer, buffer]);
        } else {
          this.buffer = buffer;
        }
        return;
      }

      let packet = buffer.slice(0, length);

      if (this.network.session.crypto.incomingChaCha) {
         let headerBytes = reverse(packet.slice(4, 6));

        reverse(this.network.session.crypto.incomingChaCha.encrypt(headerBytes)).copy(packet, 4);
      }

      let packetHeader = packet.readInt16BE(4);

      this.handlePacket(new ServerMessage(packet, Incoming.indexed[packetHeader]));

      buffer = buffer.slice(length);
    }
  }

  handlePacket(packet) {
    if (this.handlers[packet.header]) {
      console.log('[INCOMING][' + packet.name + ']', packet.getMessageBody());

      let handler = new this.handlers[packet.header]();
      handler.client = this.network.client;
      handler.session = this.network.session;
      handler.network = this.network;
      handler.packetHandler = this;
      handler.packet = packet;

      handler.handle();
    } else {
      console.log('[UNHANDLED INCOMING][' + packet.name + ']', packet.getMessageBody());
    }
  }

  loadRoom(roomId, password) {
    console.log(roomId);
    let getGuestRoom = new GetGuestRoomComposer(roomId);
    let flatOpc = new FlatOpcComposer(roomId, password ? password : '');

    this.sendMessages([getGuestRoom, flatOpc]);
  }

  sendPrivateMessage(recieverId, message) {
    this.sendMessage(new SendMessageComposer(recieverId, message));
  }

  followFriend(targetId) {
    this.sendMessage(new FollowFriendComposer(targetId));
  }

  leaveRoom() {
    this.sendMessage(new QuitComposer());
  }

  sendChat(message, styleId, chatTrackingId) {
    this.sendMessage(new ChatComposer(message, styleId, chatTrackingId));
  }

  sendShout(message, styleId) {
      this.sendMessage(new ShoutComposer(message, styleId));
  }

  instantiate() {
    this.registerPackets();

    let hello = new HelloComposer('18C199405558FE3C4534DF9E', 'UNITY3');
    let initDhHandshake = new InitDhHandshakeComposer();

    this.sendMessages([hello, initDhHandshake]);
  }

  sendMessage(message) {
    message.compose();

    let buffer = message.response.get();
    let packetName = Outgoing.indexed[message.response.header];

    console.log('[OUTGOING]', `[${packetName}]`,message.response.getMessageBody());

    if (this.network.session.crypto.outgoingChaCha) {
      let headerBytes = reverse(buffer.slice(4, 6));

      reverse(this.network.session.crypto.outgoingChaCha.encrypt(headerBytes)).copy(buffer, 4);
    }

    this.network.tlsClient.prepare(buffer.toString('binary'));
  }

  sendMessages(messages) {
    let buffer = Buffer.alloc(0);

    messages.forEach(message => {
      message.compose();

      let messageBuffer = message.response.get();
      let packetName = Outgoing.indexed[message.response.header];
    
      console.log('[OUTGOING]', `[${packetName}]`,message.response.getMessageBody());

      if (this.network.session.crypto.outgoingChaCha) {
        let headerBytes = reverse(messageBuffer.slice(4, 6));

        reverse(this.network.session.crypto.outgoingChaCha.encrypt(headerBytes)).copy(messageBuffer, 4);
      }

      buffer = Buffer.concat([buffer, messageBuffer]);
    });

    this.network.tlsClient.prepare(buffer.toString('binary'));
  }
}

module.exports = PacketHandler;