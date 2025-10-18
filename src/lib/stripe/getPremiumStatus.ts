import { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
  Query,
  DocumentData,
} from 'firebase/firestore';

/**
 * Checks if the current user has an active or trialing subscription
 * Returns a promise that resolves to true if premium, false otherwise
 */
export const getPremiumStatus = async (app: FirebaseApp): Promise<boolean> => {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not logged in. Unable to retrieve premium status.');
  }

  const db = getFirestore(app);
  const subscriptionsRef = collection(db, 'customers', userId, 'subscriptions');
  const q: Query<DocumentData> = query(
    subscriptionsRef,
    where('status', 'in', ['trialing', 'active'])
  );

  return new Promise<boolean>((resolve, reject) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          if (snapshot.size === 1) {
            console.log('Active or trialing subscription found');
            resolve(true);
          } else if (snapshot.size === 0) {
            console.log('No active or trialing subscriptions found');
            resolve(false);
          } else {
            console.warn('Unexpected number of subscriptions found:', snapshot.size);
            // If multiple active subscriptions exist, user is still premium
            resolve(true);
          }
        } catch (error) {
          console.error('Error processing subscription snapshot:', error);
          reject(error);
        } finally {
          console.log('Unsubscribing from subscription listener');
          unsubscribe();
        }
      },
      (error) => {
        console.error('Error in subscription snapshot listener:', error);
        reject(error);
      }
    );
  });
};

/**
 * Alternative method that checks premium status from user document
 * This is faster but requires the webhook to keep user.isPremium updated
 */
export const getPremiumStatusFromUser = async (app: FirebaseApp): Promise<boolean> => {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not logged in. Unable to retrieve premium status.');
  }

  const db = getFirestore(app);
  const { doc, getDoc } = await import('firebase/firestore');
  
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.warn('User document not found');
    return false;
  }

  const userData = userDoc.data();
  return userData?.isPremium || false;
};
