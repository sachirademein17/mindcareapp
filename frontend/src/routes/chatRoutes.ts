// Frontend chat API service functions
const API_BASE_URL = 'http://localhost:5000/api';

export const chatAPI = {
  // Get chat messages between current user and another user
  getMessages: async (withUserId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${withUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (receiverId: string, message: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/send/${receiverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat list (users with whom current user has chatted)
  getChatList: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chat list: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat list:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (userId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/read/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
};
