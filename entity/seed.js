const mongoose = require('mongoose');
const User = require('./User');
const UserProfile = require('./UserProfile');
const FRA = require('./FRA');
const FRACategory = require('./FRACategory');
require('dotenv').config();

async function seed() {
  try {
    // Step 1: Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 2: Clear existing data
    await User.deleteMany({});
    await UserProfile.deleteMany({});
    await FRA.deleteMany({});
    await FRACategory.deleteMany({});

    console.log('✅ Existing data cleared');

    // Step 3: Create 100 users for each role
    const users = [];

    const roleGroups = [
      {
        role: 'user_admin',
        usernamePrefix: 'user',
        namePrefix: 'User Admin',
        emailPrefix: 'user'
      },
      {
        role: 'fundraiser',
        usernamePrefix: 'fr',
        namePrefix: 'Fundraiser',
        emailPrefix: 'fr'
      },
      {
        role: 'donee',
        usernamePrefix: 'donee',
        namePrefix: 'Donee',
        emailPrefix: 'donee'
      },
      {
        role: 'platform_management',
        usernamePrefix: 'pm',
        namePrefix: 'Platform Manager',
        emailPrefix: 'pm'
      }
    ];

    for (const group of roleGroups) {
      for (let i = 1; i <= 100; i++) {
        const username = group.usernamePrefix + i;

        users.push({
          username: username,
          password: username, // password same as username
          role: group.role,
          name: group.namePrefix + ' ' + i,
          email: group.emailPrefix + i + '@test.com',
          phoneNumber: generatePhoneNumber(i)
        });
      }
    }

    for (const u of users) {
      await new User(u).save();
    }

    console.log('✅ Seeded ' + users.length + ' users');

    // Step 4: Create the 4 user profiles
    const profiles = [
      {
        roleName: 'user_admin',
        description: 'Manages user accounts, profiles and system access across the platform.'
      },
      {
        roleName: 'fundraiser',
        description: 'Creates and manages fundraising activities, tracks views and interests.'
      },
      {
        roleName: 'donee',
        description: 'Browses, saves and donates to fundraising activities on the platform.'
      },
      {
        roleName: 'platform_management',
        description: 'Manages FRA categories, generates reports and oversees platform settings.'
      }
    ];

    for (const p of profiles) {
      await new UserProfile(p).save();
    }

    console.log('✅ Seeded ' + profiles.length + ' user profiles');

    // Step 5: Create 100 categories
    const categories = [];

    for (let i = 1; i <= 100; i++) {
      categories.push({
        catName: 'Category ' + i,
        fraIDs: [i],
        description: 'This is category ' + i + ' for FRA ' + i,
        suspended: false
      });
    }

    for (const c of categories) {
      await new FRACategory(c).save();
    }

    console.log('✅ Seeded ' + categories.length + ' FRA categories');

    // Step 6: Create 100 FRAs
    const fras = [];

    for (let i = 1; i <= 100; i++) {
      const isCompleted = i <= 50;

      let startDate;
      let endDate;
      let createdAt;

      if (isCompleted) {
        // FRA 1 to FRA 50: completed
        // End date is before 2026
        createdAt = randomDate(
          new Date(2025, 0, 1, 12, 0, 0),
          new Date(2025, 5, 30, 12, 0, 0)
        );

        startDate = randomDate(
          createdAt,
          new Date(2025, 9, 30, 12, 0, 0)
        );

        endDate = randomDate(
          startDate,
          new Date(2025, 11, 31, 12, 0, 0)
        );
      } else {
        // FRA 51 to FRA 100: ongoing
        // End date is after 2026
        createdAt = randomDate(
          new Date(2025, 0, 1, 12, 0, 0),
          new Date(2025, 11, 31, 12, 0, 0)
        );

        startDate = randomDate(
          createdAt,
          new Date(2025, 11, 31, 12, 0, 0)
        );

        endDate = randomDate(
          new Date(2026, 5, 1, 12, 0, 0),
          new Date(2027, 11, 31, 12, 0, 0)
        );
      }

      fras.push({
        fraID: i,
        fraName: 'FRA ' + i,
        category: 'Category ' + i,
        startDate: startDate,
        endDate: endDate,
        description: 'This is the description for FRA ' + i,
        targetAmount: 1000 + i * 100,
        suspended: false,
        viewCount: 0,
        createdAt: createdAt
      });
    }

    for (const f of fras) {
      await new FRA(f).save();
    }

    console.log('✅ Seeded ' + fras.length + ' FRAs');

    console.log('\nTest credentials:');
    console.log('  User Admin:           user1 / user1');
    console.log('  Fundraiser:           fr1 / fr1');
    console.log('  Donee:                donee1 / donee1');
    console.log('  Platform Management:  pm1 / pm1');

    console.log('\n✅ Seeding completed successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

function generatePhoneNumber(i) {
  const prefixes = ['8', '9', '6'];
  const prefix = prefixes[i % prefixes.length];

  const number = String(1000000 + ((i * 13729) % 9000000)).slice(0, 7);

  return prefix + number;
}
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}
seed();