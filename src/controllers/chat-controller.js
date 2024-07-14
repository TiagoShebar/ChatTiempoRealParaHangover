const ChatService = require('../services/chat-service.js');

const chatService = new ChatService()

async function checkChat(users) {
    const exists = await chatService.checkChat(users[0], users[1]);
  };

async function recoverChat(users){
    const messages = await chatService.recoverChat(users[0], users[1]);
    return messages;
}

async function createMessage(users, content) {
    const creation = await chatService.createMessage(users[0], users[1], content);
    return creation;
}

/*async function getOffsetPosible(limit, users){
    const offsetMax = await chatService.getOffsetPosible(limit, users[0], users[1]);
    return offsetMax;
}*/

  module.exports = {
    checkChat,
    recoverChat,
    createMessage
  };

