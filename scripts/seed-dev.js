/**
 * Development Seeding Script
 * Quick seeding for local development using Firebase client SDK
 * 
 * Usage: npm run seed:dev
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');
require('dotenv').config();

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Development seed data
const DEV_USERS = [
  {
    email: 'dev@test.com',
    password: 'Test123!',
    displayName: 'Dev User',
    isAdmin: false,
  },
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    displayName: 'Admin Dev',
    isAdmin: true,
  },
];

const DEV_TICKETS = [
  {
    type: 'Bug',
    message: 'Test bug ticket for development',
    ticketStatus: 'submitted',
  },
  {
    type: 'Feature Request',
    message: 'Test feature request for development',
    ticketStatus: 'in_progress',
  },
  {
    type: 'Help',
    message: 'Test help ticket for development',
    ticketStatus: 'resolved',
    adminResponse: 'This is a test response',
  },
];

async function createDevUser(userData) {
  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const user = userCredential.user;
    
    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      email: userData.email,
      displayName: userData.displayName,
      isAdmin: userData.isAdmin,
      createdAt: Date.now(),
      plan: 'free',
    });
    
    console.log(`✅ Created user: ${userData.email}`);
    return user;
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  User already exists: ${userData.email}`);
      // Try to sign in to get the user
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        return userCredential.user;
      } catch (signInError) {
        console.log(`⚠️  Could not sign in as ${userData.email}`);
        return null;
      }
    } else {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
      return null;
    }
  }
}

async function createDevTickets(userId) {
  console.log('\n🌱 Creating dev support tickets...');
  
  for (const ticket of DEV_TICKETS) {
    try {
      const ticketData = {
        userId: userId,
        type: ticket.type,
        message: ticket.message,
        ticketStatus: ticket.ticketStatus,
        timestamp: Date.now(),
      };
      
      if (ticket.adminResponse) {
        ticketData.adminResponse = ticket.adminResponse;
        ticketData.resolvedAt = Date.now();
      }
      
      await addDoc(collection(db, 'supportTickets'), ticketData);
      console.log(`✅ Created ticket: ${ticket.type}`);
      
    } catch (error) {
      console.error(`❌ Error creating ticket:`, error.message);
    }
  }
}

async function createDevAnnouncements() {
  console.log('\n🌱 Creating dev announcements...');
  
  const announcements = [
    {
      title: 'Development Environment',
      message: 'This is a development environment. All data is for testing purposes.',
      type: 'info',
      createdAt: Date.now(),
      isActive: true,
    },
  ];
  
  for (const announcement of announcements) {
    try {
      await addDoc(collection(db, 'announcements'), announcement);
      console.log(`✅ Created announcement: ${announcement.title}`);
    } catch (error) {
      console.error(`❌ Error creating announcement:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting development seeding...\n');
  
  if (!firebaseConfig.apiKey) {
    console.error('❌ Firebase configuration not found. Please check your .env file.');
    process.exit(1);
  }
  
  try {
    console.log('🌱 Creating dev users...');
    
    const users = [];
    for (const userData of DEV_USERS) {
      const user = await createDevUser(userData);
      if (user) {
        users.push(user);
      }
    }
    
    // Create tickets for first non-admin user
    const regularUser = users.find((u, i) => !DEV_USERS[i].isAdmin);
    if (regularUser) {
      await createDevTickets(regularUser.uid);
    }
    
    // Create announcements
    await createDevAnnouncements();
    
    console.log('\n✨ Development seeding completed!');
    console.log('\n📋 Dev Users:');
    DEV_USERS.forEach(u => {
      console.log(`   - ${u.email} (password: ${u.password})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
