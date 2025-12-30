const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DATA STORAGE (temporary, in memory)
let expenses = [
  { id: 1, amount: 500, category: 'Food', description: 'Lunch' },
  { id: 2, amount: 1000, category: 'Transport', description: 'Uber' }
];

// ROUTE 1: GET all expenses
app.get('/api/expenses', (req, res) => {
  res.json({ 
    success: true,
    count: expenses.length,
    data: expenses 
  });
});

// ROUTE 2: GET single expense by ID
app.get('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const expense = expenses.find(e => e.id === id);
  
  if (!expense) {
    return res.status(404).json({ 
      success: false,
      message: 'Expense not found' 
    });
  }
  
  res.json({ 
    success: true,
    data: expense 
  });
});

// ROUTE 3: CREATE new expense (POST)
app.post('/api/expenses', (req, res) => {
  const { amount, category, description } = req.body;
  
  // Validation
  if (!amount || !category) {
    return res.status(400).json({ 
      success: false,
      message: 'Amount and category are required' 
    });
  }
  
  // Create new expense
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    amount,
    category,
    description: description || ''
  };
  
  expenses.push(newExpense);
  
  res.status(201).json({ 
    success: true,
    message: 'Expense created',
    data: newExpense 
  });
});

// ROUTE 4: UPDATE expense (PUT)
app.put('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, category, description } = req.body;
  
  const expense = expenses.find(e => e.id === id);
  
  if (!expense) {
    return res.status(404).json({ 
      success: false,
      message: 'Expense not found' 
    });
  }
  
  // Update fields if provided
  if (amount) expense.amount = amount;
  if (category) expense.category = category;
  if (description) expense.description = description;
  
  res.json({ 
    success: true,
    message: 'Expense updated',
    data: expense 
  });
});

// ROUTE 5: DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = expenses.findIndex(e => e.id === id);
  
  if (index === -1) {
    return res.status(404).json({ 
      success: false,
      message: 'Expense not found' 
    });
  }
  
  const deletedExpense = expenses.splice(index, 1);
  
  res.json({ 
    success: true,
    message: 'Expense deleted',
    data: deletedExpense[0] 
  });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is running',
    timestamp: new Date()
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong',
    message: err.message 
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Test it at: http://localhost:${PORT}/api/health`);
});
