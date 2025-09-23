import express from "express";
import { boats } from "./boats.js";
import { cars } from "./cars.js";
import { houses } from "./houses.js";
import { planes } from "./planes.js";

const app = express();

const welcomeStrings = [
  "Hello stranger!",
  "Want to use my simple asset API but don't know the endpoints? Let me help you",
  "We got /cars, /boats, /houses and /planes",
];

app.get("/", (_req, res) => {
  res.send(welcomeStrings.join("\n\n"));
});

app.get("/cars", (_req, res) => {
  res.json(cars);
});

app.get("/boats", (_req, res) => {
  res.json(boats);
});

app.get("/houses", (_req, res) => {
  res.json(houses);
});

app.get("/planes", (_req, res) => {
  res.json(planes);
});

export default app;
