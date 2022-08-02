const MessageHandler = require('../MessageHandler');

class MessengerNewConsoleMessageEvent extends MessageHandler {
    handle() {
        this.senderId = parseInt(this.packet.readLong());
        this.message = this.packet.readString();

        console.log("Recieved private message from friend n°" + this.senderId + ": " + this.message.replace("G�", ""));

        if (this.message.startsWith("do")) {
            this.message = this.message.substring(3).split(" ");

            const command = this.message[0];
            const args = this.message.slice(1);
            switch (command) {
                case "sayPM":
                    setTimeout(() => {this.client.sendPrivateMessage(this.senderId, args.join(" "));}, 1000);
                break;
                case "say":
                    //setTimeout(() => {this.client.sendChat(args.join(" "));}, 1000);
                    this.client.sendChat("This is a test, only a test.")
                break;
                case "shout":
                    setTimeout(() => {this.client.sendShout(args.join(" "));}, 1000);
                break;

                case "home":
                    this.client.loadRoom(46143931);
                break;
                case "joinme":
                    this.client.followFriend(this.senderId);
                break;
                case "leave":
                    this.client.leaveRoom();
                break;

                case "dc":
                    process.exit(0);
                default:
                    setTimeout(() => {this.client.sendPrivateMessage(this.senderId, "Unknown command!");}, 1000);
             }

            console.log("Replied to friend n°" + this.senderId);
        }
    }
}

module.exports = MessengerNewConsoleMessageEvent;