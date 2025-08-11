import { 
  users,
  weightEntries,
  medications,
  injectionLogs,
  dataImports,
  type User, 
  type InsertUser,
  type UpsertUser,
  type WeightEntry, 
  type InsertWeightEntry,
  type Medication, 
  type InsertMedication,
  type InjectionLog, 
  type InsertInjectionLog,
  type DataImport, 
  type InsertDataImport
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users (including Replit Auth methods)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Weight Entries
  getWeightEntries(userId: string, limit?: number): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  getLatestWeight(userId: string): Promise<WeightEntry | undefined>;
  deleteWeightEntry(entryId: string): Promise<void>;

  // Medications
  getUserMedications(userId: string): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<Medication>;
  getActiveMedication(userId: string): Promise<Medication | undefined>;

  // Injection Logs
  getInjectionLogs(userId: string, medicationId?: string): Promise<InjectionLog[]>;
  createInjectionLog(log: InsertInjectionLog): Promise<InjectionLog>;
  getInjectionCount(userId: string, medicationId?: string): Promise<number>;
  deleteInjectionLog(logId: string): Promise<void>;

  // Data Imports
  createDataImport(dataImport: InsertDataImport): Promise<DataImport>;
  updateDataImport(id: string, updates: Partial<DataImport>): Promise<DataImport>;
  getUserDataImports(userId: string): Promise<DataImport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private weightEntries: Map<string, WeightEntry> = new Map();
  private medications: Map<string, Medication> = new Map();
  private injectionLogs: Map<string, InjectionLog> = new Map();
  private dataImports: Map<string, DataImport> = new Map();

  constructor() {
    // Create a demo user with sample data
    const demoUserId = randomUUID();
    const demoUser: User = {
      id: demoUserId,
      username: "demo",
      password: "demo123",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      startWeight: null,
      goalWeight: null,
      weightUnit: "lbs",
      hasCompletedOnboarding: "false",
      createdAt: new Date(),
    };
    this.users.set(demoUserId, demoUser);

    // Add sample weight entries
    const weightData = [
      { weight: "185.5", date: new Date("2024-01-01") },
      { weight: "183.2", date: new Date("2024-01-08") },
      { weight: "181.8", date: new Date("2024-01-15") },
      { weight: "179.5", date: new Date("2024-01-22") },
      { weight: "177.2", date: new Date("2024-01-29") },
      { weight: "175.8", date: new Date("2024-02-05") },
      { weight: "173.5", date: new Date("2024-02-12") },
      { weight: "171.2", date: new Date("2024-02-19") },
      { weight: "169.8", date: new Date("2024-02-26") },
      { weight: "167.5", date: new Date("2024-03-05") },
      { weight: "165.2", date: new Date("2024-03-12") },
      { weight: "162.5", date: new Date("2024-03-19") },
    ];

    weightData.forEach((data, index) => {
      const id = randomUUID();
      this.weightEntries.set(id, {
        id,
        userId: demoUserId,
        weight: data.weight,
        unit: "lbs",
        date: data.date,
        notes: null,
        createdAt: data.date,
      });
    });

    // Add sample medication
    const medicationId = randomUUID();
    this.medications.set(medicationId, {
      id: medicationId,
      userId: demoUserId,
      name: "Ozempic (Semaglutide)",
      type: "semaglutide",
      currentDose: "1.0",
      targetDose: "2.0",
      unit: "mg",
      frequency: "weekly",
      startDate: new Date("2024-01-01"),
      nextDoseDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      titrationSchedule: [
        { weeks: "1-4", dose: 0.25, status: "completed" },
        { weeks: "5-8", dose: 0.5, status: "completed" },
        { weeks: "9-12", dose: 1.0, status: "current" },
        { weeks: "13+", dose: 2.0, status: "upcoming" },
      ],
      isActive: "true",
      createdAt: new Date("2024-01-01"),
    });

    // Add sample injection logs
    for (let i = 0; i < 12; i++) {
      const id = randomUUID();
      const date = new Date();
      date.setDate(date.getDate() - (i * 7)); // Weekly injections
      
      this.injectionLogs.set(id, {
        id,
        userId: demoUserId,
        medicationId,
        dose: i < 4 ? "0.25" : i < 8 ? "0.5" : "1.0",
        unit: "mg",
        injectionSite: ["abdomen", "thigh", "arm"][i % 3],
        date,
        notes: null,
        createdAt: date,
      });
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");
    
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Weight entry methods
  async getWeightEntries(userId: string, limit?: number): Promise<WeightEntry[]> {
    const entries = Array.from(this.weightEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? entries.slice(0, limit) : entries;
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const id = randomUUID();
    const weightEntry: WeightEntry = { 
      ...entry, 
      id, 
      createdAt: new Date(),
      date: new Date(entry.date)
    };
    this.weightEntries.set(id, weightEntry);
    return weightEntry;
  }

  async getLatestWeight(userId: string): Promise<WeightEntry | undefined> {
    const entries = await this.getWeightEntries(userId, 1);
    return entries[0];
  }

  async deleteWeightEntry(entryId: string): Promise<void> {
    this.weightEntries.delete(entryId);
  }

  // Medication methods
  async getUserMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values())
      .filter(med => med.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const med: Medication = { 
      ...medication, 
      id, 
      createdAt: new Date(),
      startDate: new Date(medication.startDate),
      nextDoseDate: medication.nextDoseDate ? new Date(medication.nextDoseDate) : null
    };
    this.medications.set(id, med);
    return med;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const existing = this.medications.get(id);
    if (!existing) throw new Error("Medication not found");
    
    const updated = { ...existing, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async getActiveMedication(userId: string): Promise<Medication | undefined> {
    return Array.from(this.medications.values())
      .find(med => med.userId === userId && med.isActive === "true");
  }

  // Injection log methods
  async getInjectionLogs(userId: string, medicationId?: string): Promise<InjectionLog[]> {
    return Array.from(this.injectionLogs.values())
      .filter(log => {
        if (log.userId !== userId) return false;
        if (medicationId && log.medicationId !== medicationId) return false;
        return true;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createInjectionLog(log: InsertInjectionLog): Promise<InjectionLog> {
    const id = randomUUID();
    const injectionLog: InjectionLog = { 
      ...log, 
      id, 
      createdAt: new Date(),
      date: new Date(log.date)
    };
    this.injectionLogs.set(id, injectionLog);
    return injectionLog;
  }

  async getInjectionCount(userId: string, medicationId?: string): Promise<number> {
    const logs = await this.getInjectionLogs(userId, medicationId);
    return logs.length;
  }

  async deleteInjectionLog(logId: string): Promise<void> {
    this.injectionLogs.delete(logId);
  }

  // Data import methods
  async createDataImport(dataImport: InsertDataImport): Promise<DataImport> {
    const id = randomUUID();
    const importRecord: DataImport = { 
      ...dataImport, 
      id, 
      createdAt: new Date()
    };
    this.dataImports.set(id, importRecord);
    return importRecord;
  }

  async updateDataImport(id: string, updates: Partial<DataImport>): Promise<DataImport> {
    const existing = this.dataImports.get(id);
    if (!existing) throw new Error("Data import not found");
    
    const updated = { ...existing, ...updates };
    this.dataImports.set(id, updated);
    return updated;
  }

  async getUserDataImports(userId: string): Promise<DataImport[]> {
    return Array.from(this.dataImports.values())
      .filter(imp => imp.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Weight entry operations
  async getWeightEntries(userId: string, limit?: number): Promise<WeightEntry[]> {
    const query = db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.date));
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const [weightEntry] = await db
      .insert(weightEntries)
      .values(entry)
      .returning();
    return weightEntry;
  }

  async getLatestWeight(userId: string): Promise<WeightEntry | undefined> {
    const entries = await this.getWeightEntries(userId, 1);
    return entries[0];
  }

  async deleteWeightEntry(entryId: string): Promise<void> {
    await db.delete(weightEntries).where(eq(weightEntries.id, entryId));
  }

  // Medication operations
  async getUserMedications(userId: string): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.createdAt));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [med] = await db
      .insert(medications)
      .values(medication)
      .returning();
    return med;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const [medication] = await db
      .update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return medication;
  }

  async getActiveMedication(userId: string): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.createdAt))
      .limit(1);
    return medication;
  }

  // Injection log operations
  async getInjectionLogs(userId: string, medicationId?: string): Promise<InjectionLog[]> {
    const query = db
      .select()
      .from(injectionLogs)
      .where(eq(injectionLogs.userId, userId))
      .orderBy(desc(injectionLogs.date));

    return await query;
  }

  async createInjectionLog(log: InsertInjectionLog): Promise<InjectionLog> {
    const [injectionLog] = await db
      .insert(injectionLogs)
      .values(log)
      .returning();
    return injectionLog;
  }

  async getInjectionCount(userId: string, medicationId?: string): Promise<number> {
    const logs = await this.getInjectionLogs(userId, medicationId);
    return logs.length;
  }

  async deleteInjectionLog(logId: string): Promise<void> {
    await db.delete(injectionLogs).where(eq(injectionLogs.id, logId));
  }

  // Data import operations
  async createDataImport(dataImport: InsertDataImport): Promise<DataImport> {
    const [importRecord] = await db
      .insert(dataImports)
      .values(dataImport)
      .returning();
    return importRecord;
  }

  async updateDataImport(id: string, updates: Partial<DataImport>): Promise<DataImport> {
    const [dataImport] = await db
      .update(dataImports)
      .set(updates)
      .where(eq(dataImports.id, id))
      .returning();
    return dataImport;
  }

  async getUserDataImports(userId: string): Promise<DataImport[]> {
    return await db
      .select()
      .from(dataImports)
      .where(eq(dataImports.userId, userId))
      .orderBy(desc(dataImports.createdAt));
  }
}

// Use DatabaseStorage for production
export const storage = new DatabaseStorage();
