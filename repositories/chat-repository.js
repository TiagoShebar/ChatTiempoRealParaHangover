const pg = require('pg');
const { DBConfig } = require('./dbconfig.js');


class ChatRepository { 
    constructor() {
        const { Client } = pg;
        this.DBClient = new Client(DBConfig);
        this.DBClient.connect();
    }

    async getChatId(id1, id2){
        let query = `
        SELECT chat_id 
        FROM chat_members 
        WHERE user_id IN ($1, $2) 
        GROUP BY chat_id 
        HAVING COUNT(*) = 2
        `;

        const result = await this.DBClient.query(query, [id1, id2]);
        if (result.rows.length > 0) {
            return result.rows[0].chat_id;
        } else {
            // Manejar el caso en que no se encontró ningún chat_id
            return null; // O algún otro valor indicativo de ausencia de resultado
        }
    }

    async checkChat(id1, id2) {
        try {
            let result = await this.getChatId(id1, id2);
            if(result === null){
                let query = "INSERT INTO chats (name) VALUES (null) RETURNING id";
                result = await this.DBClient.query(query);
                const newChatId = result.rows[0].id;

                if(newChatId){
                    query = "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2), ($1, $3)";
                    result = await this.DBClient.query(query, [newChatId, id1, id2]);
                    if(result.rowCount !== 2){
                        throw new Error('Failed to insert chat members');
                    }
                    else{
                        return true;
                    }
                }
            }
            else{
                return true;
            }
        } catch (error) {
            console.error('Error checking chat:', error);
            throw error;
        }
    }

    async recoverChat(id1, id2){
        try {
            let result = await this.getChatId(id1, id2);
            if(result !== null){
                const query = "SELECT * FROM messages WHERE chat_id = $1 AND date_sent < CURRENT_TIMESTAMP";
                const messages = await this.DBClient.query(query, [result]);
                return messages;
            }
            else{
                throw new Error('Chat not found');
            }
        }
        catch (error) {
            console.error('Error recovering chat:', error);
            throw error;
        }
    }

    async createMessage(id1, id2, content){
        let query = "INSERT INTO messages (content, date_sent, sender_user, chat_id) VALUES ($1, CURRENT_TIMESTAMP, $2, $3) RETURNING id, content, date_sent, sender_user";
        try{
            let result = await this.getChatId(id1, id2);
            if(result !== null){
                const creation = await this.DBClient.query(query, [content, id1, result]);
                if(creation.rowCount === 0){
                    throw new Error('Failed to create message');
                }
                else{
                    return creation;
                }
            }
            else{
                throw new Error('Chat not found');
            }
            
        }
        catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }

    /*async getOffsetPosible(limit, id1, id2){
        try{
                let result = await this.getChatId(id1, id2);
                if(result !== null){
                    let query = "SELECT COUNT(id) AS total from messages WHERE chat_id = $1";
                    const total = await this.DBClient.query(query, [result]);
                    return Math.ceil((total.rows[0].total/limit))-1;
                }
                else{
                    throw new Error('Chat not found');
                }
        }
        catch (error) {
            console.error('Error getting max offset:', error);
            throw error;
        }
    }*/

    
}

module.exports = ChatRepository;