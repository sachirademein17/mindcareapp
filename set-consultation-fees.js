const { Client } = require('pg');

async function setConsultationFees() {
    console.log('💰 Setting Consultation Fees for All Doctors');
    console.log('===========================================');
    
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'mental_health_db',
        user: 'postgres',
        password: 'dehiwalaZoo'
    });
    
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');
        
        // Update all doctors without consultation fees
        const updateResult = await client.query(`
            UPDATE "DoctorDetails" 
            SET "consultationFee" = 50.00 
            WHERE "consultationFee" IS NULL OR "consultationFee" = 0
        `);
        
        console.log(`✅ Updated ${updateResult.rowCount} doctors with $50.00 consultation fee`);
        
        // Verify the update
        const verifyResult = await client.query(`
            SELECT 
                u.name as doctor_name,
                u.email,
                dd.specialization,
                dd."consultationFee",
                dd.approved
            FROM "Users" u
            JOIN "DoctorDetails" dd ON u.id = dd."userId"
            WHERE u.role = 'doctor' AND dd.approved = true
            ORDER BY dd."consultationFee" DESC
            LIMIT 10
        `);
        
        console.log('\n📋 Approved Doctors with Fees (Top 10):');
        console.log('======================================');
        
        verifyResult.rows.forEach((doctor, index) => {
            console.log(`${index + 1}. ${doctor.doctor_name}`);
            console.log(`   Email: ${doctor.email}`);
            console.log(`   Specialization: ${doctor.specialization}`);
            console.log(`   Fee: $${doctor.consultationFee}`);
            console.log('');
        });
        
        console.log('🎉 Payment system should now work for all approved doctors!');
        console.log('📝 Test by booking with any approved doctor.');
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await client.end();
    }
}

setConsultationFees().catch(console.error);
