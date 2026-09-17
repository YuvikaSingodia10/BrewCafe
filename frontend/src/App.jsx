import { useState } from "react";
import axios from "axios";
import "./App.css";

const API =
  "https://turbo-carnival-7vpw5x7gx7rphx9pg-5000.app.github.dev/api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState("");

  const [phone, setPhone] = useState("");
  const [foundMember, setFoundMember] = useState(null);

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      setUser(response.data.user);
      setMessage("Login successful");

      await loadBalance(response.data.user.id);
      await loadNotifications();
      await loadMembers("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  const loadBalance = async (userId) => {
    try {
      const response = await axios.get(`${API}/rewards/balance/${userId}`);
      setBalance(response.data.member);
    } catch (error) {
      setMessage("Could not load balance");
    }
  };

  const purchase = async () => {
    try {
      const response = await axios.post(`${API}/rewards/purchase`, {
        userId: user.id,
        amount: 100,
        referenceId: `ORDER-${Date.now()}`,
      });

      setMessage(
        `Purchase successful! Earned ${response.data.pointsEarned} points`
      );

      await loadBalance(user.id);
      await loadNotifications();
    } catch (error) {
      setMessage(error.response?.data?.message || "Purchase failed");
    }
  };

  const redeem = async () => {
    try {
      const response = await axios.post(`${API}/rewards/redeem`, {
        userId: user.id,
        points: 50,
        rewardName: "Free Coffee",
      });

      setMessage("Reward redeemed successfully");

      await loadBalance(user.id);
      await loadNotifications();
    } catch (error) {
      setMessage(error.response?.data?.message || "Redemption failed");
    }
  };

  const lookupMember = async () => {
    if (!phone.trim()) {
      setMessage("Enter a phone number");
      return;
    }

    try {
      const response = await axios.get(
        `${API}/members/phone/${encodeURIComponent(phone)}`
      );

      setFoundMember(response.data.member);
      setMessage("Member found");
    } catch (error) {
      setFoundMember(null);
      setMessage(error.response?.data?.message || "Member not found");
    }
  };

  const loadMembers = async (searchValue) => {
    try {
      const response = await axios.get(`${API}/members`, {
        params: { search: searchValue },
      });

      setMembers(response.data.members || []);
    } catch (error) {
      setMessage("Could not load members");
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`${API}/outbox`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      setMessage("Could not load notifications");
    }
  };

  const getTierProgress = () => {
    if (!balance) return null;

    const lifetime = Number(balance.lifetime_earned_points || 0);

    if (lifetime < 500) {
      return {
        nextTier: "SILVER",
        remaining: 500 - lifetime,
      };
    }

    if (lifetime < 1000) {
      return {
        nextTier: "GOLD",
        remaining: 1000 - lifetime,
      };
    }

    if (lifetime < 2000) {
      return {
        nextTier: "PLATINUM",
        remaining: 2000 - lifetime,
      };
    }

    return {
      nextTier: "Maximum tier reached",
      remaining: 0,
    };
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h1>☕ BrewCafe Rewards</h1>
          <p>Login to manage your rewards</p>

          <form onSubmit={login}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <p>{message}</p>
        </div>
      </div>
    );
  }

  const progress = getTierProgress();

  return (
    <div className="container">
      <div className="card">
        <h1>☕ BrewCafe Rewards</h1>
        <h2>Welcome, {user.name}</h2>

        {balance && (
          <div className="balance">
            <h3>{balance.points_balance} Points</h3>
            <p>Lifetime Earned: {balance.lifetime_earned_points}</p>
            <p>Tier: {balance.tier}</p>

            {progress && (
              <p>
                {progress.remaining > 0
                  ? `${progress.remaining} points needed for ${progress.nextTier}`
                  : progress.nextTier}
              </p>
            )}
          </div>
        )}

        <button onClick={purchase}>Record ₹100 Purchase</button>
        <button onClick={redeem}>Redeem 50 Points</button>
        <button onClick={loadNotifications}>Refresh Notifications</button>

        <p>{message}</p>

        <hr />

        <h2>Staff Member Lookup</h2>

        <input
          type="text"
          placeholder="Enter member phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button onClick={lookupMember}>Find Member</button>

        {foundMember && (
          <div className="balance">
            <h3>Member Details</h3>
            <p>Name: {foundMember.name}</p>
            <p>Phone: {foundMember.phone}</p>
            <p>Tier: {foundMember.tier}</p>
            <p>Balance: {foundMember.points_balance} points</p>
          </div>
        )}

        <hr />

        <h2>Member List</h2>

        <input
          type="text"
          placeholder="Search by name, email or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            loadMembers(e.target.value);
          }}
        />

        <div>
          {members.length === 0 ? (
            <p>No members found</p>
          ) : (
            members.map((member) => (
              <div className="balance" key={member.id}>
                <p>
                  <strong>{member.name}</strong>
                </p>
                <p>Email: {member.email}</p>
                <p>Phone: {member.phone}</p>
                <p>Tier: {member.tier}</p>
                <p>Balance: {member.points_balance} points</p>
              </div>
            ))
          )}
        </div>

        <hr />

        <h2>Notifications</h2>

        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <div className="balance" key={notification.id}>
              <p>{notification.message}</p>
              <small>{notification.created_at}</small>
            </div>
          ))
        )}

        <button
          onClick={() => {
            setUser(null);
            setBalance(null);
            setFoundMember(null);
            setMembers([]);
            setNotifications([]);
            setMessage("");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;