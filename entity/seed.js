const mongoose = require('mongoose');
const User = require('./User');
const UserProfile = require('./UserProfile');
require('dotenv').config();

const roles = ['user_admin', 'fundraiser', 'donee', 'platform_management'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Seed Users
  await User.deleteMany({});
  const users = [];

  users.push({ username: 'admin1',  password: 'admin123', role: 'user_admin',          name: 'Admin User',       email: 'admin@test.com',  phoneNumber: '91234567' });
  users.push({ username: 'fr1',     password: 'fr123',    role: 'fundraiser',           name: 'John Fundraiser',  email: 'fr@test.com',     phoneNumber: '82345678' });
  users.push({ username: 'donee1',  password: 'donee123', role: 'donee',                name: 'Jane Donee',       email: 'donee@test.com',  phoneNumber: '73456789' });
  users.push({ username: 'pm1',     password: 'pm123',    role: 'platform_management',  name: 'Platform Manager', email: 'pm@test.com',     phoneNumber: '64567890' });

  /*for (const role of roles) {
    const shortName = role.replace('_', '');
    for (let i = 2; i <= 25; i++) {
      const prefix = ['6', '8', '9'][i % 3];
      const phoneNumber = prefix + String(Math.floor(1000000 + (i * 137 + 42) % 9000000)).slice(0, 7);
      users.push({
        username: `${shortName}_user${i}`,
        password: 'password123',
        role,
        name: `${role.replace(/_/g, ' ')} User ${i}`,
        email: `${shortName}${i}@test.com`,
        phoneNumber
      });
    }
  }*/

  for (const u of users) await new User(u).save();
  console.log(`✅ Seeded ${users.length} users`);

  // Seed User Profiles
  await UserProfile.deleteMany({});
  const profiles = [
    { roleName: 'user_admin',          description: 'Manages user accounts, profiles and system access across the platform.' },
    { roleName: 'fundraiser',          description: 'Creates and manages fundraising activities, tracks views and interests.' },
    { roleName: 'donee',               description: 'Browses, saves and donates to fundraising activities on the platform.' },
    { roleName: 'platform_management', description: 'Manages FSA categories, generates reports and oversees platform settings.' },
  ];

  for (const p of profiles) await new UserProfile(p).save();
  console.log(`✅ Seeded ${profiles.length} user profiles`);

  console.log('\nTest credentials:');
  console.log('  User Admin:      admin1 / admin123');
  console.log('  Fundraiser:      fr1 / fr123');
  console.log('  Donee:           donee1 / donee123');
  console.log('  Platform Mgmt:   pm1 / pm123');
  process.exit();
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });