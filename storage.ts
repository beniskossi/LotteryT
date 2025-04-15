import { users, type User, type InsertUser, lotteryDraws, type LotteryDraw, type InsertLotteryDraw, type LotteryCategory } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lottery Draw operations
  getAllDraws(category: LotteryCategory): Promise<LotteryDraw[]>;
  getDrawById(id: number): Promise<LotteryDraw | undefined>;
  createDraw(draw: InsertLotteryDraw): Promise<LotteryDraw>;
  deleteDraw(id: number): Promise<boolean>;
  deleteAllDrawsByCategory(category: LotteryCategory): Promise<boolean>;
  
  // Statistics operations
  getBallFrequency(category: LotteryCategory, ballNumber: number): Promise<number>;
  getTopFrequentBalls(category: LotteryCategory, limit: number): Promise<{ballNumber: number, frequency: number}[]>;
  getLeastFrequentBalls(category: LotteryCategory, limit: number): Promise<{ballNumber: number, frequency: number}[]>;
  getAllBallFrequencies(category: LotteryCategory): Promise<{ballNumber: number, frequency: number}[]>;
  
  // Consultation operations
  getSimultaneousOccurrences(category: LotteryCategory, ballNumber: number): Promise<{ballNumber: number, frequency: number}[]>;
  getSubsequentOccurrences(category: LotteryCategory, ballNumber: number): Promise<{ballNumber: number, frequency: number}[]>;
  getDrawsWithBall(category: LotteryCategory, ballNumber: number): Promise<LotteryDraw[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private draws: Map<number, LotteryDraw>;
  currentUserId: number;
  currentDrawId: number;

  constructor() {
    this.users = new Map();
    this.draws = new Map();
    this.currentUserId = 1;
    this.currentDrawId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllDraws(category: LotteryCategory): Promise<LotteryDraw[]> {
    return Array.from(this.draws.values())
      .filter((draw) => draw.category === category)
      .sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());
  }

  async getDrawById(id: number): Promise<LotteryDraw | undefined> {
    return this.draws.get(id);
  }

  async createDraw(insertDraw: InsertLotteryDraw): Promise<LotteryDraw> {
    const id = this.currentDrawId++;
    const draw: LotteryDraw = { 
      ...insertDraw, 
      id, 
      createdAt: new Date().toISOString() // Fixed: Convert Date to string
    };
    this.draws.set(id, draw);
    return draw;
  }

  async deleteDraw(id: number): Promise<boolean> {
    return this.draws.delete(id);
  }

  async deleteAllDrawsByCategory(category: LotteryCategory): Promise<boolean> {
    let success = true;
    
    for (const [id, draw] of [...this.draws.entries()]) { // Fixed: Spread to array
      if (draw.category === category) {
        const result = this.draws.delete(id);
        if (!result) success = false;
      }
    }
    
    return success;
  }

  async getBallFrequency(category: LotteryCategory, ballNumber: number): Promise<number> {
    const draws = await this.getAllDraws(category);
    
    return draws.filter(draw => 
      draw.ball1 === ballNumber || 
      draw.ball2 === ballNumber || 
      draw.ball3 === ballNumber || 
      draw.ball4 === ballNumber || 
      draw.ball5 === ballNumber
    ).length;
  }

  async getTopFrequentBalls(category: LotteryCategory, limit: number): Promise<{ballNumber: number, frequency: number}[]> {
    const frequencies = await this.getAllBallFrequencies(category);
    
    return frequencies
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  async getLeastFrequentBalls(category: LotteryCategory, limit: number): Promise<{ballNumber: number, frequency: number}[]> {
    const frequencies = await this.getAllBallFrequencies(category);
    
    return frequencies
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, limit);
  }

  async getAllBallFrequencies(category: LotteryCategory): Promise<{ballNumber: number, frequency: number}[]> {
    const draws = await this.getAllDraws(category);
    const frequencies: Map<number, number> = new Map();
    
    // Initialize frequencies for all balls from 1 to 90
    for (let i = 1; i <= 90; i++) {
      frequencies.set(i, 0);
    }
    
    // Count occurrences
    for (const draw of draws) {
      [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5].forEach(ball => {
        frequencies.set(ball, (frequencies.get(ball) || 0) + 1);
      });
    }
    
    return Array.from(frequencies.entries()).map(([ballNumber, frequency]) => ({
      ballNumber,
      frequency
    }));
  }

  async getSimultaneousOccurrences(category: LotteryCategory, ballNumber: number): Promise<{ballNumber: number, frequency: number}[]> {
    const draws = await this.getAllDraws(category);
    const frequencies: Map<number, number> = new Map();
    
    // Initialize frequencies for all balls from 1 to 90
    for (let i = 1; i <= 90; i++) {
      if (i !== ballNumber) {
        frequencies.set(i, 0);
      }
    }
    
    // Count simultaneous occurrences
    for (const draw of draws) {
      const balls = [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5];
      
      if (balls.includes(ballNumber)) {
        balls.forEach(ball => {
          if (ball !== ballNumber) {
            frequencies.set(ball, (frequencies.get(ball) || 0) + 1);
          }
        });
      }
    }
    
    return Array.from(frequencies.entries())
      .map(([ballNumber, frequency]) => ({ ballNumber, frequency }))
      .filter(item => item.frequency > 0)
      .sort((a, b) => b.frequency - a.frequency);
  }

  async getSubsequentOccurrences(category: LotteryCategory, ballNumber: number): Promise<{ballNumber: number, frequency: number}[]> {
    const draws = await this.getAllDraws(category);
    const frequencies: Map<number, number> = new Map();
    
    // Initialize frequencies
    for (let i = 1; i <= 90; i++) {
      frequencies.set(i, 0);
    }
    
    // Sort draws by date, oldest first to find subsequent draws
    const sortedDraws = [...draws].sort((a, b) => 
      new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime()
    );
    
    for (let i = 0; i < sortedDraws.length - 1; i++) {
      const currentDraw = sortedDraws[i];
      const nextDraw = sortedDraws[i + 1];
      
      // Check if current draw contains the ball number
      const balls = [currentDraw.ball1, currentDraw.ball2, currentDraw.ball3, currentDraw.ball4, currentDraw.ball5];
      
      if (balls.includes(ballNumber)) {
        // Count the balls in the subsequent draw
        [nextDraw.ball1, nextDraw.ball2, nextDraw.ball3, nextDraw.ball4, nextDraw.ball5].forEach(ball => {
          frequencies.set(ball, (frequencies.get(ball) || 0) + 1);
        });
      }
    }
    
    return Array.from(frequencies.entries())
      .map(([ballNumber, frequency]) => ({ ballNumber, frequency }))
      .filter(item => item.frequency > 0)
      .sort((a, b) => b.frequency - a.frequency);
  }

  async getDrawsWithBall(category: LotteryCategory, ballNumber: number): Promise<LotteryDraw[]> {
    const draws = await this.getAllDraws(category);
    
    return draws.filter(draw => 
      draw.ball1 === ballNumber || 
      draw.ball2 === ballNumber || 
      draw.ball3 === ballNumber || 
      draw.ball4 === ballNumber || 
      draw.ball5 === ballNumber
    );
  }
}

export const storage = new MemStorage();