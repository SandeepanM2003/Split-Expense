import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export const createGroup = async (groupData) => {
  await addDoc(collection(db, 'groups'), {
    ...groupData,
    createdAt: new Date()
  });
};

export const getGroups = async (userEmail) => {
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', userEmail)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
