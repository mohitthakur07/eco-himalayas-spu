import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import QRCodeModel from './models/QRCode.js';
import Transaction from './models/Transaction.js';
import Device from './models/Device.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'ecohimalayas',
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await QRCodeModel.deleteMany({});
    await Transaction.deleteMany({});
    await Device.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create dummy user
    console.log('👤 Creating dummy user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const dummyUser = new User({
      username: 'eco_warrior',
      email: 'eco@himalayas.com',
      password: hashedPassword,
      ecoBalance: 250,
    });

    await dummyUser.save();
    console.log('✅ User created:');
    console.log(`   Username: ${dummyUser.username}`);
    console.log(`   Email: ${dummyUser.email}`);
    console.log(`   Password: password123`);
    console.log(`   Balance: ${dummyUser.ecoBalance} eco-coins\n`);

    // Create some QR codes
    console.log('📱 Creating QR codes...');
    const qrCodes = [
      {
        userId: dummyUser._id,
        qrData: 'ECO-VALIDATED-001',
        wasteType: 'plastic',
        estimatedWeight: 2.5,
        status: 'validated',
        validatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: dummyUser._id,
        qrData: 'ECO-VALIDATED-002',
        wasteType: 'paper',
        estimatedWeight: 5.0,
        status: 'validated',
        validatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: dummyUser._id,
        qrData: 'ECO-VALIDATED-003',
        wasteType: 'glass',
        estimatedWeight: 3.0,
        status: 'validated',
        validatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        userId: dummyUser._id,
        qrData: 'ECO-VALIDATED-004',
        wasteType: 'metal',
        estimatedWeight: 1.5,
        status: 'validated',
        validatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        userId: dummyUser._id,
        qrData: 'ECO-VALIDATED-005',
        wasteType: 'organic',
        estimatedWeight: 4.0,
        status: 'validated',
        validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        userId: dummyUser._id,
        qrData: 'ECO-PENDING-001',
        wasteType: 'plastic',
        estimatedWeight: 1.0,
        status: 'pending',
      },
      {
        userId: dummyUser._id,
        qrData: 'ECO-PENDING-002',
        wasteType: 'paper',
        estimatedWeight: 2.0,
        status: 'pending',
      },
    ];

    const createdQRCodes = await QRCodeModel.insertMany(qrCodes);
    console.log(`✅ Created ${createdQRCodes.length} QR codes`);
    console.log(`   - ${qrCodes.filter(q => q.status === 'validated').length} validated`);
    console.log(`   - ${qrCodes.filter(q => q.status === 'pending').length} pending\n`);

    // Create transactions for validated QR codes
    console.log('💰 Creating transactions...');
    const rewardRates = {
      plastic: 10,
      paper: 5,
      glass: 8,
      metal: 12,
      organic: 3,
    };

    const transactions = [];
    for (const qr of createdQRCodes.filter(q => q.status === 'validated')) {
      const reward = Math.round(qr.estimatedWeight * rewardRates[qr.wasteType]);
      transactions.push({
        userId: dummyUser._id,
        qrCodeId: qr._id,
        amount: reward,
        type: 'reward',
        createdAt: qr.validatedAt,
      });
    }

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${createdTransactions.length} transactions`);
    
    let totalRewards = 0;
    transactions.forEach(t => {
      totalRewards += t.amount;
      console.log(`   - ${t.amount} coins from ${createdQRCodes.find(q => q._id.equals(t.qrCodeId)).wasteType}`);
    });
    console.log(`   Total rewards: ${totalRewards} eco-coins\n`);

    // Create a dummy device
    console.log('🤖 Creating dummy device...');
    const dummyDevice = new Device({
      deviceName: 'RaspberryPi-Station-Demo',
      location: 'Kathmandu Central Collection Point',
      status: 'active',
      lastSeen: new Date(),
    });

    await dummyDevice.save();
    console.log('✅ Device created:');
    console.log(`   Name: ${dummyDevice.deviceName}`);
    console.log(`   Location: ${dummyDevice.location}`);
    console.log(`   ID: ${dummyDevice._id}\n`);

    // Summary
    console.log('=' .repeat(60));
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: 1`);
    console.log(`   QR Codes: ${createdQRCodes.length}`);
    console.log(`   Transactions: ${createdTransactions.length}`);
    console.log(`   Devices: 1`);
    console.log(`   Total Eco-Coins: ${dummyUser.ecoBalance}\n`);
    
    console.log('🔐 Login Credentials:');
    console.log(`   Email: eco@himalayas.com`);
    console.log(`   Password: password123\n`);
    
    console.log('🌐 Access the app at: http://localhost:5174');
    console.log('=' .repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
