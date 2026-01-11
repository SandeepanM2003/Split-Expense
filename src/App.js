import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { signIn, signUp, logOut } from './services/authService';
import { addExpense, getExpenses } from './services/expenseService';
import { createGroup, getGroups } from './services/groupService';


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH ---------------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  /* ---------------- DATA ---------------- */
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);

  /* ---------------- UI ---------------- */
  const [paymentMode, setPaymentMode] = useState('personal');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  /* ---------------- EXPENSE FORM ---------------- */
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});

  /* ---------------- GROUP FORM ---------------- */
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');

  /* ---------------- AUTH LISTENER ---------------- */
  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setExpenses(await getExpenses(currentUser.email));
        setGroups(await getGroups(currentUser.email));
      } else {
        setExpenses([]);
        setGroups([]);
      }
      setLoading(false);
    });
  }, []);

  const handleAuth = async () => {
    if (isSignUp) await signUp(email, password);
    else await signIn(email, password);
    setEmail('');
    setPassword('');
  };

  /* ---------- CUSTOM SPLIT ---------- */
  const handleCustomSplitChange = (member, value, members) => {
    const total = Number(amount) || 0;
    const updated = { ...customSplits, [member]: value };

    const lastMember = members[members.length - 1];
    const sumOthers = members
      .filter(m => m !== lastMember)
      .reduce((s, m) => s + (updated[m] || 0), 0);

    if (member !== lastMember) {
      updated[lastMember] = Math.max(total - sumOthers, 0);
    }

    setCustomSplits(updated);
  };

  /* ---------------- CREATE GROUP ---------------- */
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Group name required');
      return;
    }

    const members = [
      user.email,
      ...newGroupMembers
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)
    ];

    await createGroup({
      name: newGroupName,
      members: [...new Set(members)]
    });

    setGroups(await getGroups(user.email));
    setNewGroupName('');
    setNewGroupMembers('');
    setShowCreateGroup(false);
  };

  /* ---------------- ADD EXPENSE ---------------- */
  const handleAddExpense = async () => {
    if (!description || !amount) return;

    if (paymentMode === 'group' && !selectedGroup) {
      alert('Select a group');
      return;
    }

    const isPersonal = paymentMode === 'personal';

    const participants = isPersonal
      ? [user.email]
      : groups.find(g => g.id === selectedGroup)?.members || [user.email];

    await addExpense({
      description,
      amount: parseFloat(amount),
      groupId: isPersonal ? 'personal' : selectedGroup,
      paidBy: user.email,
      splitType: isPersonal ? 'equal' : splitType,
      splitWith: participants,
      customSplits: isPersonal || splitType === 'equal' ? {} : customSplits
    });

    setExpenses(await getExpenses(user.email));

    setDescription('');
    setAmount('');
    setSelectedGroup('');
    setSplitType('equal');
    setCustomSplits({});
  };

  /* ================= SPLITWISE LOGIC ================= */
  let youOwe = 0;
  let youGet = 0;
  let totalExpenses = 0;

  expenses.forEach(exp => {
    // ✅ Only money YOU paid
    if (exp.paidBy === user.email) {
      totalExpenses += exp.amount;
    }

    // Ignore expenses not involving you
    if (!exp.splitWith.includes(user.email)) return;

    const splits =
      exp.splitType === 'equal'
        ? Object.fromEntries(
            exp.splitWith.map(e => [e, exp.amount / exp.splitWith.length])
          )
        : exp.customSplits;

    const yourShare = splits[user.email] || 0;

    if (exp.paidBy === user.email) {
      youGet += exp.amount - yourShare;
    } else {
      youOwe += yourShare;
    }
  });
  /* ================================================== */

  if (loading) return <div className="center">Loading...</div>;

  /* ---------------- AUTH UI ---------------- */
  if (!user) {
    return (
      <div className="auth-box">
        <div className="logo">
  <span className="logo-icon">💸</span>
  <span className="logo-text">SplitExpense</span>
</div>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleAuth}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        <p className="link" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have account? Sign In' : 'New user? Sign Up'}
        </p>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <>
      <header>
        <div className="logo">
  <span className="logo-icon">💸</span>
  <span className="logo-text">SplitExpense</span>
</div>

        <div>
          <span>{user.email}</span>
          <button className="secondary" onClick={logOut}>
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        {/* DASHBOARD */}
        <div className="dashboard">
          <div className="card">
            <p>Total Expenses</p>
            <h3>₹{totalExpenses.toFixed(2)}</h3>
          </div>
          <div className="card red">
            <p>You Owe</p>
            <h3>₹{youOwe.toFixed(2)}</h3>
          </div>
          <div className="card green">
            <p>You Get</p>
            <h3>₹{youGet.toFixed(2)}</h3>
          </div>
        </div>

        {/* GROUPS */}
        <div className="card">
          <h4>Groups</h4>
          <button onClick={() => setShowCreateGroup(!showCreateGroup)}>
            + Create Group
          </button>

          {showCreateGroup && (
            <>
              <input
                placeholder="Group name"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
              />
              <input
                placeholder="Members (comma separated emails)"
                value={newGroupMembers}
                onChange={e => setNewGroupMembers(e.target.value)}
              />
              <button onClick={handleCreateGroup}>Create</button>
            </>
          )}
        </div>

        {/* ADD EXPENSE */}
        <div className="card">
          <h4>Add Expense</h4>

          <div className="tabs">
            <button
              className={paymentMode === 'personal' ? 'active' : ''}
              onClick={() => setPaymentMode('personal')}
            >
              Individual
            </button>
            <button
              className={paymentMode === 'group' ? 'active' : ''}
              onClick={() => setPaymentMode('group')}
            >
              Group
            </button>
          </div>

          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          {paymentMode === 'group' && (
            <>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                <option value="">Select Group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <select
                value={splitType}
                onChange={e => setSplitType(e.target.value)}
              >
                <option value="equal">Equal</option>
                <option value="custom">Custom</option>
              </select>

              {splitType === 'custom' &&
                groups
                  .find(g => g.id === selectedGroup)
                  ?.members.map((m, i, arr) => (
                    <input
                      key={m}
                      type="number"
                      placeholder={`${m} amount`}
                      value={customSplits[m] || ''}
                      onChange={e =>
                        handleCustomSplitChange(
                          m,
                          Number(e.target.value),
                          arr
                        )
                      }
                    />
                  ))}
            </>
          )}

          <button onClick={handleAddExpense}>Add Expense</button>

          {expenses.map(e => (
            <div key={e.id} className="row">
              <div>
                <strong>{e.description}</strong>
                <p>Paid by {e.paidBy}</p>
              </div>
              <div>₹{e.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
