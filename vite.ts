import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateLotteryDrawSchema, type LotteryCategory } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all draws for a category
  app.get("/api/draws/:category", async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category as LotteryCategory;
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }

      const draws = await storage.getAllDraws(category);
      res.json(draws);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new draw
  app.post("/api/draws", async (req: Request, res: Response): Promise<void> => {
    try {
      const drawData = validateLotteryDrawSchema.parse(req.body);
      
      // Check for duplicate ball numbers
      const balls = [drawData.ball1, drawData.ball2, drawData.ball3, drawData.ball4, drawData.ball5];
      const uniqueBalls = new Set(balls);
      
      if (uniqueBalls.size !== 5) {
        res.status(400).json({ message: "All ball numbers must be unique" });
        return;
      }

      const draw = await storage.createDraw(drawData);
      res.status(201).json(draw);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
        return;
      }
      
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a draw
  app.delete("/api/draws/:id", async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }
      
      const success = await storage.deleteDraw(id);
      
      if (!success) {
        res.status(404).json({ message: "Draw not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset all data for a category
  app.delete("/api/categories/:category/reset", async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category as LotteryCategory;
      
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }
      
      const success = await storage.deleteAllDrawsByCategory(category);
      
      if (!success) {
        res.status(500).json({ message: "Failed to delete all draws" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get statistics for a category
  app.get("/api/statistics/:category", async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category as LotteryCategory;
      
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }
      
      const topFrequent = await storage.getTopFrequentBalls(category, 5);
      const leastFrequent = await storage.getLeastFrequentBalls(category, 5);
      const allFrequencies = await storage.getAllBallFrequencies(category);
      
      res.json({
        topFrequent,
        leastFrequent,
        allFrequencies
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get consultation data for a specific ball
  app.get("/api/consult/:category/:ballNumber", async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category as LotteryCategory;
      const ballNumber = parseInt(req.params.ballNumber);
      
      if (!["GH18", "CIV10", "CIV13", "CIV16"].includes(category)) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }
      
      if (isNaN(ballNumber) || ballNumber < 1 || ballNumber > 90) {
        res.status(400).json({ message: "Ball number must be between 1 and 90" });
        return;
      }
      
      const simultaneous = await storage.getSimultaneousOccurrences(category, ballNumber);
      const subsequent = await storage.getSubsequentOccurrences(category, ballNumber);
      const drawHistory = await storage.getDrawsWithBall(category, ballNumber);
      
      res.json({
        simultaneous,
        subsequent,
        drawHistory
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}