import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { boats } from "./boats.js";
import { cars } from "./cars.js";
import { houses } from "./houses.js";
import { planes } from "./planes.js";

// Import rate limit with proper typing
import { rateLimit } from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Postman collection
const postmanCollectionPath = path.join(
  __dirname,
  "../public/postman-collection.json"
);
const postmanCollection = JSON.parse(
  fs.readFileSync(postmanCollectionPath, "utf-8")
);

const app = express();

// Trust proxy for rate limiting (important for Vercel deployment)
app.set("trust proxy", 1);

// Security middleware - manual headers instead of helmet
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Prevent referrer leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:"
  );
  next();
});

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

// Serve Postman collection
app.get("/postman-collection.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(postmanCollection);
});

function formatAssets(assets: any[]) {
  return assets.map((asset) => ({
    ...asset,
    price: asset.price.toLocaleString("de-DE"),
  }));
}

function getAssetName(asset: any) {
  if (asset.make && asset.model) {
    return `${asset.make} ${asset.model}`.trim();
  } else if (asset.name) {
    return asset.name;
  } else {
    return "";
  }
}

function sortAndFilterAssets(assets: any[], query: any) {
  let filteredAssets = [...assets];

  // Input validation and sanitization
  const allowedSortFields = ["price", "name", "id", "make", "model"];

  // Search by name with validation
  if (query.search && typeof query.search === "string") {
    const searchTerm = query.search.toLowerCase().trim();
    if (searchTerm.length > 0 && searchTerm.length <= 100) {
      filteredAssets = filteredAssets.filter((asset) =>
        getAssetName(asset).toLowerCase().includes(searchTerm)
      );
    }
  }

  // Filter by make
  if (query.make && typeof query.make === "string") {
    const makeTerm = query.make.toLowerCase().trim();
    if (makeTerm.length > 0 && makeTerm.length <= 100) {
      filteredAssets = filteredAssets.filter((asset) =>
        asset.make.toLowerCase().includes(makeTerm)
      );
    }
  }

  // Filter by model
  if (query.model && typeof query.model === "string") {
    const modelTerm = query.model.toLowerCase().trim();
    if (modelTerm.length > 0 && modelTerm.length <= 100) {
      filteredAssets = filteredAssets.filter((asset) =>
        asset.model.toLowerCase().includes(modelTerm)
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
        aValue = getAssetName(a).toLowerCase();
        bValue = getAssetName(b).toLowerCase();
      } else if (sortBy === "id") {
        aValue = a.id;
        bValue = b.id;
      } else if (sortBy === "make") {
        aValue = a.make.toLowerCase();
        bValue = b.make.toLowerCase();
      } else if (sortBy === "model") {
        aValue = a.model.toLowerCase();
        bValue = b.model.toLowerCase();
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

/**
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     description: Retrieve a list of all cars with optional filtering, sorting, and pagination
 *     parameters:
 *       - $ref: '#/components/parameters/search'
 *       - $ref: '#/components/parameters/minPrice'
 *       - $ref: '#/components/parameters/maxPrice'
 *       - $ref: '#/components/parameters/sort'
 *       - $ref: '#/components/parameters/order'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: A list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/cars", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(cars, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

/**
 * /api/cars/{id}:
 *   get:
 *     summary: Get a car by ID
 *     description: Retrieve a specific car by its ID
 *     parameters:
 *       - $ref: '#/components/parameters/assetId'
 *     responses:
 *       200:
 *         description: A car object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const car = cars.find((c) => c.id === id);
  if (car) {
    res.json(formatAssets([car])[0]);
  } else {
    res.status(404).json({ error: "Car not found" });
  }
});

/**
 * /api/boats:
 *   get:
 *     summary: Get all boats
 *     description: Retrieve a list of all boats with optional filtering, sorting, and pagination
 *     parameters:
 *       - $ref: '#/components/parameters/search'
 *       - $ref: '#/components/parameters/minPrice'
 *       - $ref: '#/components/parameters/maxPrice'
 *       - $ref: '#/components/parameters/sort'
 *       - $ref: '#/components/parameters/order'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: A list of boats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/boats", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(boats, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

/**
 * /api/boats/{id}:
 *   get:
 *     summary: Get a boat by ID
 *     description: Retrieve a specific boat by its ID
 *     parameters:
 *       - $ref: '#/components/parameters/assetId'
 *     responses:
 *       200:
 *         description: A boat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Boat not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/boats/:id", strictLimiter, (req, res) => {
  const id = parseInt(req.params.id);
  const boat = boats.find((b) => b.id === id);
  if (boat) {
    res.json(formatAssets([boat])[0]);
  } else {
    res.status(404).json({ error: "Boat not found" });
  }
});

/**
 * /api/houses:
 *   get:
 *     summary: Get all houses
 *     description: Retrieve a list of all houses with optional filtering, sorting, and pagination
 *     parameters:
 *       - $ref: '#/components/parameters/search'
 *       - $ref: '#/components/parameters/minPrice'
 *       - $ref: '#/components/parameters/maxPrice'
 *       - $ref: '#/components/parameters/sort'
 *       - $ref: '#/components/parameters/order'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: A list of houses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/houses", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(houses, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

/**
 * /api/houses/{id}:
 *   get:
 *     summary: Get a house by ID
 *     description: Retrieve a specific house by its ID
 *     parameters:
 *       - $ref: '#/components/parameters/assetId'
 *     responses:
 *       200:
 *         description: A house object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: House not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/houses/:id", strictLimiter, (req, res) => {
  const id = parseInt(req.params.id);
  const house = houses.find((h) => h.id === id);
  if (house) {
    res.json(formatAssets([house])[0]);
  } else {
    res.status(404).json({ error: "House not found" });
  }
});

/**
 * /api/planes:
 *   get:
 *     summary: Get all planes
 *     description: Retrieve a list of all planes with optional filtering, sorting, and pagination
 *     parameters:
 *       - $ref: '#/components/parameters/search'
 *       - $ref: '#/components/parameters/minPrice'
 *       - $ref: '#/components/parameters/maxPrice'
 *       - $ref: '#/components/parameters/sort'
 *       - $ref: '#/components/parameters/order'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: A list of planes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/planes", (req, res) => {
  const sortedAndFiltered = sortAndFilterAssets(planes, req.query);
  res.json(formatAssets(sortedAndFiltered));
});

/**
 * /api/planes/{id}:
 *   get:
 *     summary: Get a plane by ID
 *     description: Retrieve a specific plane by its ID
 *     parameters:
 *       - $ref: '#/components/parameters/assetId'
 *     responses:
 *       200:
 *         description: A plane object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Plane not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/planes/:id", strictLimiter, (req, res) => {
  const id = parseInt(req.params.id);
  const plane = planes.find((p) => p.id === id);
  if (plane) {
    res.json(formatAssets([plane])[0]);
  } else {
    res.status(404).json({ error: "Plane not found" });
  }
});

/**
 * /api/assets:
 *   get:
 *     summary: Get all assets
 *     description: Retrieve a combined list of all assets (cars, boats, houses, planes) with optional filtering, sorting, and pagination
 *     parameters:
 *       - $ref: '#/components/parameters/search'
 *       - $ref: '#/components/parameters/minPrice'
 *       - $ref: '#/components/parameters/maxPrice'
 *       - $ref: '#/components/parameters/sort'
 *       - $ref: '#/components/parameters/order'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: A list of all assets with type information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Asset'
 *                   - type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [car, boat, house, plane]
 *                         description: Type of asset
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
    message:
      "The requested resource does not exist. Check /api-docs for available endpoints.",
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
