import { getDocs, collection, getFirestore } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export async function fetchFormAData() {
  const usersSnapshot = await getDocs(collection(db, "User"));
  const result = {};

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const formASnapshot = await getDocs(collection(db, `User/${userId}/FormA`));

    result[userId] = [];

    formASnapshot.forEach((formDoc) => {
      result[userId].push({
        id: formDoc.id,
        ...formDoc.data()
      });
    });
  }

  return result;
}
