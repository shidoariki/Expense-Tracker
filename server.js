const { execSync } = require("child_process");

async function runMigrations() {
  try {
    console.log("Running Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("✅ Migrations completed");
  } catch (error) {
    console.warn("⚠️ Migration warning:", error.message);
    // Don't crash if migration fails - server can still start
  }
}

// Run migrations only in production
if (process.env.NODE_ENV === "production") {
  runMigrations();
}

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://expense-tracker-rho-red-84.vercel.app"]
        : "*",
    credentials: true,
  })
);

app.use(express.json());

// Middleware: Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this"
    );
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Seed some data
async function seedData() {
  try {
    const existingExpenses = await prisma.expense.findMany();

    if (existingExpenses.length === 0) {
      await prisma.expense.createMany({
        data: [
          {
            amount: 500,
            category: "Food",
            description: "Lunch at restaurant",
            userId: 1,
          },
          {
            amount: 1000,
            category: "Transport",
            description: "Uber to office",
            userId: 1,
          },
          {
            amount: 250,
            category: "Snacks",
            description: "Coffee break",
            userId: 1,
          },
        ],
        skipDuplicates: true,
      });
      console.log("✅ Seeded initial data");
    } else {
      console.log("✅ Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  }
}

// ROUTE 1: Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "API + Database connected!",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ROUTE 2: GET all expenses (user-specific)
app.get("/api/expenses", verifyToken, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ROUTE 3: GET single expense (with user ownership check)
app.get("/api/expenses/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if expense belongs to the logged-in user
    if (expense.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ROUTE 4: CREATE expense (linked to logged-in user)
app.post("/api/expenses", verifyToken, async (req, res) => {
  try {
    const { amount, category, description } = req.body;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Amount and category are required",
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description: description || "",
        userId: req.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Expense created",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ROUTE 5: UPDATE expense (ownership check)
app.put("/api/expenses/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, category, description } = req.body;

    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if expense belongs to the logged-in user
    if (expense.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : expense.amount,
        category: category || expense.category,
        description:
          description !== undefined ? description : expense.description,
      },
    });

    res.json({
      success: true,
      message: "Expense updated",
      data: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ROUTE 6: DELETE expense (with ownership check)
app.delete("/api/expenses/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if expense belongs to the logged-in user
    if (expense.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    await prisma.expense.delete({ where: { id } });

    res.json({
      success: true,
      message: "Expense deleted",
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ROUTE 7: REGISTRATION - Create new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ROUTE 8: LOGIN - Authenticate user & return JWT token
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key-change-this",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong",
    message: err.message,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// ✅ VERCEL FIX: Use serverless function export
const PORT = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== "production") {
  seedData().then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server + Database running on http://localhost:${PORT}`);
      console.log(`🔗 Test: http://localhost:${PORT}/api/health`);
    });
  });
}

// For Vercel serverless export
module.exports = app;
