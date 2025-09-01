// Check Meetings table structure
const { Client } = require('pg');

async function checkMeetingsTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mental_health_db',
    user: 'postgres',
    password: 'dehiwalaZoo'
  });

  try {
    await client.connect();
    console.log('🔄 Connected to PostgreSQL...');

    // Check if Meetings table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Meetings'
      );
    `);
    
    console.log('📋 Meetings table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get table structure
      const columns = await client.query(`
        SELECT column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'Meetings' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Meetings table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
      });
      
      // Check specifically for status column
      const statusColumn = columns.rows.find(col => col.column_name === 'status');
      if (statusColumn) {
        console.log('✅ Status column found:', statusColumn);
      } else {
        console.log('❌ Status column NOT found');
      }
    }
    
    // Check existing enums
    console.log('📋 Checking existing enums...');
    const enums = await client.query(`
      SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname LIKE '%Meetings%'
      GROUP BY t.typname;
    `);
    
    enums.rows.forEach(enumType => {
      console.log(`  - ${enumType.typname}: [${enumType.values.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔐 Connection closed');
  }
}

checkMeetingsTable();
