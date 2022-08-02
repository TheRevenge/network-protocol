const MessageComposer = require('../MessageComposer');
const Outgoing = require('../Outgoing').getInstance();

class FollowFriendComposer extends MessageComposer {
  constructor(targetId) {
    super();
    this.targetId = targetId;
  }

  compose() {
    this.response.init(Outgoing.FollowFriend);
    this.response.appendLong(this.targetId);
  }
}

module.exports = FollowFriendComposer;