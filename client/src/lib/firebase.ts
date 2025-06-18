import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// سيتم إضافة التكوين الجديد هنا
const firebaseConfig = {
  // سيتم إضافة بيانات التكوين الجديدة هنا
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app as default, auth, db };
