"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// PostgreSQL configuration - NO FALLBACK TO SQLITE
const sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mental_health_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dehiwalaZoo',
    logging: console.log, // Enable logging to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: false
    }
});
exports.sequelize = sequelize;
const connectPostgres = async () => {
    try {
        console.log('🔄 Connecting to PostgreSQL ONLY...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'mental_health_db'}`);
        console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
        return sequelize;
    }
    catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        console.error('💥 CRITICAL: Application requires PostgreSQL connection!');
        console.error('🔧 Please ensure PostgreSQL is running and credentials are correct.');
        throw new Error(`PostgreSQL connection failed: ${error.message}`);
    }
};
// Export both the connection function and sequelize instance
exports.default = connectPostgres;
