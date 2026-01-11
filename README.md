# 💸 SplitExpense

A simple expense-splitting app inspired by Splitwise. Track personal expenses, split bills with friends, and settle debts easily.

## ✨ Features

- 🔐 Email/Password authentication
- 💰 Track individual & group expenses
- ⚖️ Equal or custom split options
- 📊 Dashboard showing total expenses, debts owed & receivable
- 🎨 Clean, responsive UI

## 🛠️ Tech Stack

React • Firebase Auth • Firestore • HTML/CSS

## 🚀 Quick Start

### Clone & Install
```bash
git clone https://github.com/SandeepanM2003/Split-Expense.git
cd SplitExpense
npm install
```

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password) & **Firestore Database**
3. Add your config to `src/services/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Run
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Structure
```
src/
├── services/
│   ├── firebase.js          # Firebase config (gitignored)
│   ├── authService.js       # Authentication
│   ├── expenseService.js    # Expense operations
│   └── groupService.js      # Group management
├── App.js
└── App.css
```

## ⭐ Support

If you like this project, give it a star on GitHub!

---

Built with ❤️ by Sandeepan Mohanty