import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import QRCodeModel from './models/QRCode.js';
import Transaction from './models/Transaction.js';
import Device from './models/Device.js';
import Event from './models/Event.js';

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
    await Event.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create dummy users
    console.log('👤 Creating dummy users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const districts = [
      'Hamirpur', 'Shimla', 'Kangra', 'Mandi', 'Kullu', 
      'Solan', 'Una', 'Bilaspur', 'Chamba', 'Sirmaur'
    ];

    const users = [
      { username: 'eco_warrior', email: 'eco@himalayas.com', district: 'Hamirpur', balance: 250, role: 'user' },
      { username: 'green_hero', email: 'green@himalayas.com', district: 'Shimla', balance: 320, role: 'user' },
      { username: 'nature_lover', email: 'nature@himalayas.com', district: 'Kangra', balance: 180, role: 'user' },
      { username: 'eco_champion', email: 'champion@himalayas.com', district: 'Hamirpur', balance: 290, role: 'user' },
      { username: 'clean_earth', email: 'clean@himalayas.com', district: 'Mandi', balance: 210, role: 'user' },
      { username: 'green_warrior', email: 'warrior@himalayas.com', district: 'Kullu', balance: 150, role: 'user' },
      { username: 'eco_savior', email: 'savior@himalayas.com', district: 'Solan', balance: 270, role: 'user' },
      { username: 'planet_protector', email: 'protector@himalayas.com', district: 'Hamirpur', balance: 195, role: 'user' },
      { username: 'earth_guardian', email: 'guardian@himalayas.com', district: 'Una', balance: 230, role: 'user' },
      { username: 'eco_master', email: 'master@himalayas.com', district: 'Bilaspur', balance: 310, role: 'user' },
      // NGO users
      { username: 'green_himachal_ngo', email: 'ngo@greenhimachal.org', district: 'Hamirpur', balance: 0, role: 'ngo' },
      { username: 'clean_shimla_ngo', email: 'ngo@cleanshimla.org', district: 'Shimla', balance: 0, role: 'ngo' },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        ecoBalance: userData.balance,
        district: userData.district,
        role: userData.role,
      });
      await user.save();
      createdUsers.push(user);
    }

    const dummyUser = createdUsers[0]; // Main test user
    const ngoUsers = createdUsers.filter(u => u.role === 'ngo');

    console.log(`✅ Created ${createdUsers.length} users`);
    console.log(`   Regular users: ${createdUsers.length - ngoUsers.length}`);
    console.log(`   NGO users: ${ngoUsers.length}`);
    console.log(`   Main user: ${dummyUser.username} (${dummyUser.district})`);
    console.log(`   Password: password123\n`);

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

    // Create sample events
    console.log('📅 Creating sample events...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = [
      {
        title: 'Hamirpur Lake Cleanup Drive',
        description: 'Join us for a community cleanup event at Hamirpur Lake. Bring your enthusiasm and help make our environment cleaner!',
        ngoId: ngoUsers[0]._id,
        ngoName: ngoUsers[0].username,
        location: {
          latitude: 31.6839,
          longitude: 76.5217,
          address: 'Hamirpur Lake, Hamirpur, HP',
        },
        district: 'Hamirpur',
        deviceId: dummyDevice._id,
        startTime: now,
        endTime: tomorrow,
        status: 'active',
        maxParticipants: 50,
        rewardPerParticipant: 100,
      },
      {
        title: 'Shimla Mall Road Cleanup',
        description: 'Help keep Shimla beautiful! Join our cleanup drive on Mall Road.',
        ngoId: ngoUsers[1]._id,
        ngoName: ngoUsers[1].username,
        location: {
          latitude: 31.1048,
          longitude: 77.1734,
          address: 'Mall Road, Shimla, HP',
        },
        district: 'Shimla',
        startTime: tomorrow,
        endTime: nextWeek,
        status: 'upcoming',
        maxParticipants: 100,
        rewardPerParticipant: 75,
      },
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} events`);
    createdEvents.forEach(event => {
      console.log(`   - ${event.title} (${event.status})`);
    });
    console.log('');

    // Summary
    console.log('=' .repeat(60));
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${createdUsers.length} (${ngoUsers.length} NGOs)`);
    console.log(`   QR Codes: ${createdQRCodes.length}`);
    console.log(`   Transactions: ${createdTransactions.length}`);
    console.log(`   Devices: 1`);
    console.log(`   Events: ${createdEvents.length}`);
    console.log(`   Total Eco-Coins: ${dummyUser.ecoBalance}\n`);
    
    console.log('🔐 Login Credentials:');
    console.log(`   User: eco@himalayas.com / password123`);
    console.log(`   NGO: ngo@greenhimachal.org / password123\n`);
    
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
