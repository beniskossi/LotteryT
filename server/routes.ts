import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateLotteryDrawSchema, type LotteryCategory } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all draws for a category
  app.get("/api/draws/:category", async (req, res) => {
    try {
      const category = req.params.category as LotteryCategory;
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const draws = await storage.getAllDraws(category);
      return res.json(draws);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new draw
  app.post("/api/draws", async (req, res) => {
    try {
      const drawData = validateLotteryDrawSchema.parse(req.body);
      
      // Check for duplicate ball numbers
      const balls = [drawData.ball1, drawData.ball2, drawData.ball3, drawData.ball4, drawData.ball5];
      const uniqueBalls = new Set(balls);
      
      if (uniqueBalls.size !== 5) {
        return res.status(400).json({ message: "All ball numbers must be unique" });
      }

      const draw = await storage.createDraw(drawData);
      return res.status(201).json(draw);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a draw
  app.delete("/api/draws/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteDraw(id);
      
      if (!success) {
        return res.status(404).json({ message: "Draw not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset all data for a category
  app.delete("/api/categories/:category/reset", async (req, res) => {
    try {
      const category = req.params.category as LotteryCategory;
      
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      const success = await storage.deleteAllDrawsByCategory(category);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete all draws" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get statistics for a category
  app.get("/api/statistics/:category", async (req, res) => {
    try {
      const category = req.params.category as LotteryCategory;
      
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      const topFrequent = await storage.getTopFrequentBalls(category, 5);
      const leastFrequent = await storage.getLeastFrequentBalls(category, 5);
      const allFrequencies = await storage.getAllBallFrequencies(category);
      
      return res.json({
        topFrequent,
        leastFrequent,
        allFrequencies
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get consultation data for a specific ball
  app.get("/api/consult/:category/:ballNumber", async (req, res) => {
    try {
      const category = req.params.category as LotteryCategory;
      const ballNumber = parseInt(req.params.ballNumber);
      
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      if (isNaN(ballNumber) || ballNumber < 1 || ballNumber > 90) {
        return res.status(400).json({ message: "Ball number must be between 1 and 90" });
      }
      
      const simultaneous = await storage.getSimultaneousOccurrences(category, ballNumber);
      const subsequent = await storage.getSubsequentOccurrences(category, ballNumber);
      const drawHistory = await storage.getDrawsWithBall(category, ballNumber);
      
      return res.json({
        simultaneous,
        subsequent,
        drawHistory
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
