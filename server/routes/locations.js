import express from "express";
import { getLocations, getLocation } from "../controllers/locations.js";
const router = express.Router();
router.get("/", getLocations);
router.get("/:slug", getLocation);
export default router;
