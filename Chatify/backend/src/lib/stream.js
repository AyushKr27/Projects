import {StreamChat} from 'stream-chat';
import "dotenv/config";
const apiKey = process.env.CHATIFY_APIKEY;
const apiSecret = process.env.CHATIFY_APISECRET;

if(!apiKey || !apiSecret) {
    console.error("Chatify API key and secret is missing");
}
const streamClient = StreamChat.getInstance(apiKey, apiSecret);
export const upsertStreamUser = async (userData) => {
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }
    catch(error) {
        console.error("Error upserting Stream user:", error);
     
    }
};

export const generateStreamToken = (userId) => {
    try {
        const userIdStr= userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);
    }
};