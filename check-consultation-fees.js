const { Client } = require('pg');

async function checkConsultationFees() {
    console.log('🔍 Checking Doctor Consultation Fees for Payment Flow');
    console.log('==================================================');
    
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
        
        // Check DoctorDetails consultation fees
        const result = await client.query(`
            SELECT 
                u.name as doctor_name,
                u.email,
                dd.specialization,
                dd."consultationFee",
                dd.approved
            FROM "Users" u
            JOIN "DoctorDetails" dd ON u.id = dd."userId"
            WHERE u.role = 'doctor'
            ORDER BY dd."consultationFee" DESC
        `);
        
        console.log('\n📋 Doctor Consultation Fees:');
        console.log('============================');
        
        if (result.rows.length === 0) {
            console.log('❌ No doctors found in database');
            return;
        }
        
        let hasValidFees = false;
        
        result.rows.forEach((doctor, index) => {
            const feeStatus = doctor.consultationFee && doctor.consultationFee > 0 
                ? `$${doctor.consultationFee}` 
                : '❌ NO FEE SET';
                
            if (doctor.consultationFee && doctor.consultationFee > 0) {
                hasValidFees = true;
            }
            
            console.log(`${index + 1}. ${doctor.doctor_name}`);
            console.log(`   Email: ${doctor.email}`);
            console.log(`   Specialization: ${doctor.specialization || 'Not set'}`);
            console.log(`   Fee: ${feeStatus}`);
            console.log(`   Approved: ${doctor.approved ? '✅' : '❌'}`);
            console.log('');
        });
        
        console.log('\n🔍 Payment Flow Analysis:');
        console.log('=========================');
        
        if (!hasValidFees) {
            console.log('❌ CRITICAL ISSUE: No doctors have consultation fees set!');
            console.log('   This will prevent payment prompts from appearing.');
            console.log('   To fix: Set consultation fees for doctors in database.');
            console.log('');
            console.log('💡 Quick Fix SQL:');
            console.log(`   UPDATE "DoctorDetails" SET "consultationFee" = 50.00 WHERE "consultationFee" IS NULL OR "consultationFee" = 0;`);
        } else {
            console.log('✅ Some doctors have consultation fees set.');
            console.log('   Payment prompts should appear for these doctors.');
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await client.end();
    }
}

checkConsultationFees().catch(console.error);
