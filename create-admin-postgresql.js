// Create admin user directly in PostgreSQL database
const bcrypt = require('bcrypt');
const { sequelize } = require('./backend/dist/config/postgres.config');
const { User } = require('./backend/dist/models/User');

async function createAdminUser() {
    try {
        console.log('🔐 Creating Admin User in PostgreSQL...');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            where: { email: 'admin@mindcare.com' } 
        });
        
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('   Email: admin@mindcare.com');
            console.log('   Password: admin123');
            return;
        }
        
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const admin = await User.create({
            name: 'System Administrator',
            email: 'admin@mindcare.com',
            password: hashedPassword,
            phone: '+94712345678',
            nic: 'ADMIN123456V',
            role: 'admin',
            gender: 'male'
        });
        
        console.log('✅ Admin user created successfully in PostgreSQL!');
        console.log('   ID:', admin.id);
        console.log('   Name:', admin.name);
        console.log('   Email:', admin.email);
        console.log('   Password: admin123');
        
        // Test admin login
        console.log('\n🔐 Testing admin login...');
        const axios = require('axios');
        
        const loginData = {
            email: 'admin@mindcare.com',
            password: 'admin123'
        };
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/admin/login', loginData);
            console.log('✅ Admin login successful!');
            console.log('   Token received:', response.data.token.substring(0, 20) + '...');
        } catch (loginError) {
            console.error('❌ Admin login failed:', loginError.response?.data || loginError.message);
        }
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        process.exit(0);
    }
}

console.log('🐘 PostgreSQL Admin User Creation');
console.log('=================================\n');
createAdminUser();
