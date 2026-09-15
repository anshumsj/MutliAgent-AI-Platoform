import React from 'react'
import api from '../api/axios'

const getMessages = async (conversationId) => {
    try{
        const { data } = await api.get(`/api/chat/getMessages/${conversationId}`);
        return data?.messages || data;
    }catch(err){
        console.error("Error fetching messages:", err.response?.data || err.message);
        return [];
    }
}

export default getMessages 