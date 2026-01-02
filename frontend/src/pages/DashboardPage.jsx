import { useState } from 'react';
import Navbar from '../components/Navbar';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

export default function DashboardPage({ onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="dashboard">
      <Navbar onLogout={onLogout} />
      <div className="dashboard-container">
        <div className="left-panel">
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </div>
        <div className="right-panel">
          <ExpenseList refreshTrigger={refreshKey} />
        </div>
      </div>
    </div>
  );
}
