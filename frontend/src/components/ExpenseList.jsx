import { useEffect, useState } from 'react';
import { expenseAPI } from '../api/client';

export default function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExpenses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await expenseAPI.delete(id);
      loadExpenses();
    } catch (err) {
      alert('Error deleting expense: ' + err.message);
    }
  };

  if (loading) return <p>Loading expenses...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="expense-list-container">
      <h3>Your Expenses ({expenses.length})</h3>
      {expenses.length === 0 ? (
        <p>No expenses yet. Add one to get started!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>₹{expense.amount}</td>
                <td>{expense.description}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(expense.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="expense-stats">
        <p>
          Total: ₹
          {expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
