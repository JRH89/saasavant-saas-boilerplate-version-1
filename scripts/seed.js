/**
 * Database Seeding Script
 * Seeds Firebase Firestore with test users and support tickets
 * 
 * Usage: npm run seed
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
let app;
try {
  // Try to use service account if available
  const serviceAccount = require('../firebase-service-account.json');
  app = initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.log('Service account not found, using default credentials');
  app = initializeApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

// Seed data
const SEED_USERS = [
  {
    email: 'admin@saasavant.com',
    password: 'Admin123!',
    displayName: 'Admin User',
    isAdmin: true,
  },
  {
    email: 'premium@saasavant.com',
    password: 'Premium123!',
    displayName: 'Premium User',
    isAdmin: false,
    plan: 'premium',
    subscriptionStatus: 'active',
  },
  {
    email: 'basic@saasavant.com',
    password: 'Basic123!',
    displayName: 'Basic User',
    isAdmin: false,
    plan: 'basic',
    subscriptionStatus: 'active',
  },
  {
    email: 'free@saasavant.com',
    password: 'Free123!',
    displayName: 'Free User',
    isAdmin: false,
    plan: 'free',
  },
  {
    email: 'canceled@saasavant.com',
    password: 'Canceled123!',
    displayName: 'Canceled User',
    isAdmin: false,
    plan: 'premium',
    subscriptionStatus: 'canceled',
  },
];

const TICKET_TYPES = ['Bug', 'Feature Request', 'Help'];
const TICKET_STATUSES = ['submitted', 'in_progress', 'resolved'];

const SAMPLE_TICKETS = [
  {
    type: 'Bug',
    message: 'The dashboard is not loading properly on mobile devices.',
    ticketStatus: 'submitted',
  },
  {
    type: 'Feature Request',
    message: 'Please add dark mode support to the application.',
    ticketStatus: 'in_progress',
  },
  {
    type: 'Help',
    message: 'How do I upgrade my subscription plan?',
    ticketStatus: 'resolved',
    adminResponse: 'You can upgrade your plan from the Dashboard > Manage Subscription page.',
  },
  {
    type: 'Bug',
    message: 'Email notifications are not being sent.',
    ticketStatus: 'in_progress',
  },
  {
    type: 'Feature Request',
    message: 'Add export functionality for user data.',
    ticketStatus: 'submitted',
  },
  {
    type: 'Help',
    message: 'I forgot my password and the reset email is not arriving.',
    ticketStatus: 'resolved',
    adminResponse: 'Please check your spam folder. I have also manually sent a reset link.',
  },
  {
    type: 'Bug',
    message: 'Payment processing fails with certain credit cards.',
    ticketStatus: 'submitted',
  },
  {
    type: 'Feature Request',
    message: 'Add two-factor authentication for enhanced security.',
    ticketStatus: 'submitted',
  },
];

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const createdUsers = [];
  
  for (const userData of SEED_USERS) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true,
      });
      
      console.log(`✅ Created auth user: ${userData.email}`);
      
      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userData.email,
        displayName: userData.displayName,
        isAdmin: userData.isAdmin || false,
        plan: userData.plan || 'free',
        subscriptionStatus: userData.subscriptionStatus || null,
        createdAt: Date.now(),
        lastLogin: null,
      });
      
      console.log(`✅ Created Firestore document for: ${userData.email}`);
      
      createdUsers.push({
        uid: userRecord.uid,
        email: userData.email,
        isAdmin: userData.isAdmin,
      });
      
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User already exists: ${userData.email}`);
        // Get existing user
        const existingUser = await auth.getUserByEmail(userData.email);
        createdUsers.push({
          uid: existingUser.uid,
          email: userData.email,
          isAdmin: userData.isAdmin,
        });
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }
  
  return createdUsers;
}

async function seedSupportTickets(users) {
  console.log('\n🌱 Seeding support tickets...');
  
  const nonAdminUsers = users.filter(u => !u.isAdmin);
  
  if (nonAdminUsers.length === 0) {
    console.log('⚠️  No non-admin users found to create tickets for');
    return;
  }
  
  for (const ticket of SAMPLE_TICKETS) {
    try {
      // Randomly assign ticket to a non-admin user
      const randomUser = nonAdminUsers[Math.floor(Math.random() * nonAdminUsers.length)];
      
      const ticketData = {
        userId: randomUser.uid,
        type: ticket.type,
        message: ticket.message,
        ticketStatus: ticket.ticketStatus,
        timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      };
      
      if (ticket.adminResponse) {
        ticketData.adminResponse = ticket.adminResponse;
        ticketData.resolvedAt = Date.now();
      }
      
      const docRef = await db.collection('supportTickets').add(ticketData);
      
      console.log(`✅ Created ticket: ${ticket.type} - ${ticket.ticketStatus} (ID: ${docRef.id})`);
      
    } catch (error) {
      console.error(`❌ Error creating ticket:`, error.message);
    }
  }
}

async function seedAnnouncements() {
  console.log('\n🌱 Seeding announcements...');
  
  const announcements = [
    {
      title: 'Welcome to SaaSavant!',
      message: 'Thank you for joining our platform. We are excited to have you here!',
      type: 'info',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      isActive: true,
    },
    {
      title: 'New Features Released',
      message: 'We have added new dashboard analytics and reporting features. Check them out!',
      type: 'feature',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      isActive: true,
    },
    {
      title: 'Scheduled Maintenance',
      message: 'We will be performing system maintenance on Sunday from 2 AM to 4 AM EST.',
      type: 'warning',
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      isActive: true,
    },
  ];
  
  for (const announcement of announcements) {
    try {
      const docRef = await db.collection('announcements').add(announcement);
      console.log(`✅ Created announcement: ${announcement.title} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error creating announcement:`, error.message);
    }
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing seed data...');
  
  try {
    // Clear support tickets
    const ticketsSnapshot = await db.collection('supportTickets').get();
    const ticketDeletes = ticketsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(ticketDeletes);
    console.log(`✅ Cleared ${ticketsSnapshot.size} support tickets`);
    
    // Clear announcements
    const announcementsSnapshot = await db.collection('announcements').get();
    const announcementDeletes = announcementsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(announcementDeletes);
    console.log(`✅ Cleared ${announcementsSnapshot.size} announcements`);
    
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    // Optional: Clear existing data
    const args = process.argv.slice(2);
    if (args.includes('--clear')) {
      await clearExistingData();
      console.log('');
    }
    
    // Seed users
    const users = await seedUsers();
    
    // Seed support tickets
    await seedSupportTickets(users);
    
    // Seed announcements
    await seedAnnouncements();
    
    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📋 Seeded Users:');
    SEED_USERS.forEach(u => {
      console.log(`   - ${u.email} (password: ${u.password})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
