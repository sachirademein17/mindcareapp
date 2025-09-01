// 📁 backend/fix-payment-foreign-key.js
const { Sequelize } = require('sequelize')
require('dotenv').config()

const connectPostgres = async () => {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'mental_health_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'dehiwalaZoo',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log
    }
  )

  try {
    await sequelize.authenticate()
    console.log('✅ Connected to database')
    return sequelize
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

const fixPaymentForeignKey = async () => {
  const sequelize = await connectPostgres()
  
  try {
    console.log('🔄 Fixing payment foreign key constraint...')
    
    // Check if foreign key constraint exists
    const constraintExists = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'Meetings' 
      AND constraint_name = 'Meetings_paymentId_fkey'
      AND constraint_type = 'FOREIGN KEY'
    `)
    
    if (constraintExists[0].length > 0) {
      console.log('🗑️ Dropping existing foreign key constraint...')
      await sequelize.query('ALTER TABLE "Meetings" DROP CONSTRAINT "Meetings_paymentId_fkey"')
    }
    
    // Change paymentId column type to INTEGER to match Payment table's id
    console.log('🔧 Converting paymentId column to INTEGER...')
    
    // First check the current column type
    const columnInfo = await sequelize.query(`
      SELECT data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Meetings' 
      AND column_name = 'paymentId'
    `)
    
    console.log('Current paymentId column info:', columnInfo[0][0])
    
    if (columnInfo[0][0]?.data_type === 'character varying') {
      // If it's VARCHAR, convert to INTEGER
      await sequelize.query(`
        ALTER TABLE "Meetings" 
        ALTER COLUMN "paymentId" TYPE INTEGER USING CASE 
          WHEN "paymentId"::text ~ '^[0-9]+$' THEN "paymentId"::INTEGER 
          ELSE NULL 
        END
      `)
    } else {
      console.log('Column is already INTEGER type or compatible')
    }
    
    // Check if Payment table exists before adding foreign key
    const paymentTableExists = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Payments'
    `)
    
    if (paymentTableExists[0].length > 0) {
      console.log('🔗 Adding foreign key constraint to Payment table...')
      await sequelize.query(`
        ALTER TABLE "Meetings" 
        ADD CONSTRAINT "Meetings_paymentId_fkey" 
        FOREIGN KEY ("paymentId") 
        REFERENCES "Payments" ("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `)
      console.log('✅ Foreign key constraint added successfully')
    } else {
      console.log('⚠️ Payment table does not exist yet - will be created during sync')
    }
    
    console.log('✅ Payment foreign key constraint fixed successfully')
    
  } catch (error) {
    console.error('❌ Error fixing payment foreign key:', error)
    throw error
  } finally {
    await sequelize.close()
  }
}

// Run the fix
fixPaymentForeignKey()
  .then(() => {
    console.log('✅ Payment foreign key fix completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Payment foreign key fix failed:', error)
    process.exit(1)
  })
