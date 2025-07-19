// 📁 backend/src/migrations/fix-chat-messages.js
const { sequelize } = require('../../dist/config/postgres.config');

async function fixChatMessagesTable() {
  try {
    console.log('🔄 Dropping chat_messages table if exists...');
    await sequelize.query('DROP TABLE IF EXISTS "chat_messages" CASCADE;');
    
    console.log('✅ chat_messages table dropped successfully');
    
    // Force sync will recreate the table with correct data types
    const { ChatMessagePG } = require('../../dist/models/ChatMessagePG');
    await ChatMessagePG.sync({ force: true });
    
    console.log('✅ chat_messages table recreated with correct data types');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing chat_messages table:', error);
    process.exit(1);
  }
}

fixChatMessagesTable();
