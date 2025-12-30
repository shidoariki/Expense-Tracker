# Expense Tracker API

A RESTful API for tracking personal expenses built with Node.js and Express.

## Features

✅ Create expenses with amount, category, description
✅ Read all expenses or single expense by ID
✅ Update existing expenses
✅ Delete expenses
✅ JSON responses with proper status codes

## Tech Stack

- **Backend:** Node.js, Express.js
- **Language:** JavaScript (ES6+)
- **API:** REST

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation


### Running the Server


Server will run on `http://localhost:5000`

## API Endpoints

### Expenses

- **GET** `/api/expenses` - Get all expenses
- **GET** `/api/expenses/:id` - Get single expense
- **POST** `/api/expenses` - Create new expense
- **PUT** `/api/expenses/:id` - Update expense
- **DELETE** `/api/expenses/:id` - Delete expense

### Health Check

- **GET** `/api/health` - API health status

## Example Requests

### Get All Expenses
curl http://localhost:5000/api/expenses

### Create Expense
curl -X POST http://localhost:5000/api/expenses
-H "Content-Type: application/json"
-d '{"amount": 500, "category": "Food", "description": "Lunch"}'


## Author

Your Name - Full-Stack Developer

## License

MIT


