const MessageHandler = require('../MessageHandler');
const MessengerNewConsoleComposer = require("../../Outgoing/Messenger/MessengerNewConsoleComposer");

class MessengerNewConsoleMessageEvent extends MessageHandler {
    handle() {
        this.senderId = parseInt(this.packet.readLong());
        this.message = this.packet.readString();

        console.log("Recieved messenger from friend n°" + this.senderId + ": " + this.message.replace("G�", ""));

        console.log("Replying to friend n°" + this.senderId);
        this.packetHandler.sendMessage(new MessengerNewConsoleComposer(this.senderId, "OK !"));
    }
}

module.exports = MessengerNewConsoleMessageEvent;