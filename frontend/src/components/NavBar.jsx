export default function Navbar({ onLogout }) {
  const email = localStorage.getItem('email') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1>💰 Expense Tracker</h1>
        <div className="nav-right">
          <span>{email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
