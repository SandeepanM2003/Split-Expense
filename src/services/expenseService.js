import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase';

export const addExpense = async (expense) => {
  await addDoc(collection(db, 'expenses'), {
    ...expense,
    createdAt: new Date()
  });
};

// ✅ SPLITWISE QUERY
export const getExpenses = async (userEmail) => {
  const q = query(
  collection(db, 'expenses'),
  where('splitWith', 'array-contains', userEmail)
);


  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteExpense = async (id) => {
  await deleteDoc(doc(db, 'expenses', id));
};
