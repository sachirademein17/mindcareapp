// Debug Authentication Script
// This script checks the database state and authentication issues

const bcrypt = require('bcrypt');

// First, let's test bcrypt directly
async function testBcrypt() {
    console.log('🔍 Testing bcrypt functionality...');
    
    const testPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    console.log('Original password:', testPassword);
    console.log('Hashed password:', hashedPassword);
    
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password match test:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    return { testPassword, hashedPassword, isMatch };
}

// Test database connection and user retrieval
async function testDatabaseConnection() {
    try {
        console.log('\n🗄️ Testing database connection...');
        
        // Import the database configuration
        const connectPostgres = require('./backend/dist/config/postgres.config');
        await connectPostgres.default();
        
        console.log('✅ Database connection established');
        
        // Import User model
        const { User } = require('./backend/dist/models/User');
        
        // Check if admin user exists
        console.log('\n👨‍💼 Checking admin user...');
        const adminUser = await User.findOne({ 
            where: { email: 'admin@mindcare.com' } 
        });
        
        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log('   ID:', adminUser.id);
            console.log('   Name:', adminUser.name);
            console.log('   Email:', adminUser.email);
            console.log('   Role:', adminUser.role);
            console.log('   Password Hash:', adminUser.password.substring(0, 20) + '...');
            
            // Test password comparison
            console.log('\n🔐 Testing password verification...');
            const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
            console.log('Password verification:', isPasswordValid ? '✅ VALID' : '❌ INVALID');
            
            if (!isPasswordValid) {
                console.log('\n🔧 Creating new admin with fresh password...');
                const newHashedPassword = await bcrypt.hash('admin123', 10);
                await adminUser.update({ password: newHashedPassword });
                console.log('✅ Admin password updated');
                
                // Test again
                const retestPassword = await bcrypt.compare('admin123', newHashedPassword);
                console.log('Retest password:', retestPassword ? '✅ VALID' : '❌ STILL INVALID');
            }
            
        } else {
            console.log('❌ Admin user not found - creating new one...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = await User.create({
                name: 'System Administrator',
                email: 'admin@mindcare.com',
                password: hashedPassword,
                phone: '+94712345678',
                nic: 'ADMIN123456V',
                role: 'admin',
                gender: 'male'
            });
            
            console.log('✅ New admin created with ID:', newAdmin.id);
        }
        
        // Check patient user
        console.log('\n👤 Checking patient user...');
        const patientUser = await User.findOne({ 
            where: { email: 'patient@mindcare.com' } 
        });
        
        if (patientUser) {
            console.log('✅ Patient user found:');
            console.log('   ID:', patientUser.id);
            console.log('   Name:', patientUser.name);
            console.log('   Email:', patientUser.email);
            console.log('   Role:', patientUser.role);
        } else {
            console.log('❌ Patient user not found - creating new one...');
            
            const hashedPassword = await bcrypt.hash('patient123', 10);
            const newPatient = await User.create({
                name: 'Test Patient',
                email: 'patient@mindcare.com',
                password: hashedPassword,
                phone: '+94771234567',
                nic: '199012345678',
                role: 'patient',
                gender: 'male',
                dob: new Date('1990-01-15')
            });
            
            console.log('✅ New patient created with ID:', newPatient.id);
        }
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Test JWT functionality
function testJWT() {
    console.log('\n🎫 Testing JWT functionality...');
    
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    
    console.log('JWT Secret:', JWT_SECRET.substring(0, 10) + '...');
    
    const testPayload = { id: 1, role: 'admin' };
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1d' });
    
    console.log('Generated token:', token.substring(0, 50) + '...');
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ JWT verification successful:', decoded);
    } catch (error) {
        console.log('❌ JWT verification failed:', error.message);
    }
}

// Main test function
async function runDiagnostics() {
    console.log('🔬 MindCare Authentication Diagnostics');
    console.log('=====================================\n');
    
    await testBcrypt();
    await testDatabaseConnection();
    testJWT();
    
    console.log('\n🏁 Diagnostics completed!');
    console.log('\nNow try logging in again with:');
    console.log('👨‍💼 Admin: admin@mindcare.com / admin123');
    console.log('👤 Patient: patient@mindcare.com / patient123');
    
    process.exit(0);
}

runDiagnostics().catch(console.error);
