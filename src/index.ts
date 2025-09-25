import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { boats } from "./boats.js";
import { cars } from "./cars.js";
import { houses } from "./houses.js";
import { planes } from "./planes.js";

// Import helmet and rate limit with proper typing
import { rateLimit } from "express-rate-limit";

// Dynamic import for helmet to avoid ES module issues
const helmet = (await import("helmet")).default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for rate limiting (important for Vercel deployment)
app.set("trust proxy", 1);

// Security middleware
app.use((helmet as any)());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://matti-assets-api.vercel.app/"] // Replace with your actual domain
        : ["http://localhost:3000", "http://localhost:5173"], // Common dev ports
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter); // Apply to API routes only

// Stricter rate limiting for individual asset requests
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for individual assets
  message: {
    error: "Too many individual asset requests, please try again later.",
    retryAfter: "15 minutes",
  },
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

function formatAssets(assets: any[]) {
  return assets.map((asset) => ({
    ...asset,
    price: asset.price.toLocaleString("de-DE"),
  }));
}

function sortAndFilterAssets(assets: any[], query: any) {
  let filteredAssets = [...assets];

  // Input validation and sanitization
  const allowedSortFields = ["price", "name", "id"];

  // Search by name with validation
  if (query.search && typeof query.search === "string") {
    const searchTerm = query.search.toLowerCase().trim();
    if (searchTerm.length > 0 && searchTerm.length <= 100) {
      filteredAssets = filteredAssets.filter((asset) =>
        asset.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  // Price range filtering with validation
  if (query.min_price) {
    const minPrice = parseInt(query.min_price);
    if (!isNaN(minPrice) && minPrice >= 0 && minPrice <= 1000000000) {
      filteredAssets = filteredAssets.filter(
        (asset) => asset.price >= minPrice
      );
    }
  }
  if (query.max_price) {
    const maxPrice = parseInt(query.max_price);
    if (!isNaN(maxPrice) && maxPrice >= 0 && maxPrice <= 1000000000) {
      filteredAssets = filteredAssets.filter(
        (asset) => asset.price <= maxPrice
      );
    }
  }

  // Sorting with validation
  if (query.sort && allowedSortFields.includes(query.sort)) {
    const sortBy = query.sort;
    const order = query.order === "desc" ? -1 : 1;

    filteredAssets.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "price") {
        aValue = a.price;
        bValue = b.price;
      } else if (sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy === "id") {
        aValue = a.id;
        bValue = b.id;
      } else {
        return 0; // No sorting if invalid sort field
      }

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  // Limit results with validation
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (!isNaN(limit) && limit > 0 && limit <= 1000) {
      filteredAssets = filteredAssets.slice(0, limit);
    }
  }

  return filteredAssets;
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/cars", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(cars, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

app.get("/api/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const car = cars.find((c) => c.id === id);
  if (car) {
    res.json(formatAssets([car])[0]);
  } else {
    res.status(404).json({ error: "Car not found" });
  }
});

app.get("/api/boats", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(boats, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

app.get("/api/boats/:id", strictLimiter, (req, res) => {
  const id = parseInt(req.params.id);
  const boat = boats.find((b) => b.id === id);
  if (boat) {
    res.json(formatAssets([boat])[0]);
  } else {
    res.status(404).json({ error: "Boat not found" });
  }
});

app.get("/api/houses", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(houses, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

app.get("/api/houses/:id", strictLimiter, (req, res) => {
  const id = parseInt(req.params.id);
  const house = houses.find((h) => h.id === id);
  if (house) {
    res.json(formatAssets([house])[0]);
  } else {
    res.status(404).json({ error: "House not found" });
  }
});

app.get("/api/planes", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(planes, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

app.get("/api/planes/:id", strictLimiter, (req, res) => {
  const id = parseInt(req.params.id);
  const plane = planes.find((p) => p.id === id);
  if (plane) {
    res.json(formatAssets([plane])[0]);
  } else {
    res.status(404).json({ error: "Plane not found" });
  }
});

app.get("/api/assets", (req, res) => {
  // Combine all assets with type information
  const allAssets = [
    ...cars.map((car) => ({ ...car, type: "car" })),
    ...boats.map((boat) => ({ ...boat, type: "boat" })),
    ...houses.map((house) => ({ ...house, type: "house" })),
    ...planes.map((plane) => ({ ...plane, type: "plane" })),
  ];

  const sortedAndFiltered = sortAndFilterAssets(allAssets, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: "The requested resource does not exist",
    availableEndpoints: [
      "GET /",
      "GET /api/cars",
      "GET /api/cars/:id",
      "GET /api/boats",
      "GET /api/boats/:id",
      "GET /api/houses",
      "GET /api/houses/:id",
      "GET /api/planes",
      "GET /api/planes/:id",
      "GET /api/assets",
    ],
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV !== "production";

    res.status(500).json({
      error: "Internal server error",
      message: isDevelopment ? err.message : "Something went wrong",
      ...(isDevelopment && { stack: err.stack }),
    });
  }
);

export default app;
