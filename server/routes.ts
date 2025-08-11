import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWeightEntrySchema,
  insertMedicationSchema,
  insertInjectionLogSchema,
  insertDataImportSchema
} from "@shared/schema";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Weight entries
  app.get("/api/weight-entries/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getWeightEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  app.post("/api/weight-entries", async (req, res) => {
    try {
      const data = insertWeightEntrySchema.parse(req.body);
      const entry = await storage.createWeightEntry(data);
      res.json(entry);
    } catch (error) {
      console.error("Weight entry creation error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/weight-entries/:userId/latest", async (req, res) => {
    try {
      const { userId } = req.params;
      const entry = await storage.getLatestWeight(userId);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Medications
  app.get("/api/medications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const medications = await storage.getUserMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  app.get("/api/medications/:userId/active", async (req, res) => {
    try {
      const { userId } = req.params;
      const medication = await storage.getActiveMedication(userId);
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const data = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(data);
      res.json(medication);
    } catch (error) {
      console.error("Medication creation error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const medication = await storage.updateMedication(id, req.body);
      res.json(medication);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Medication not found" });
    }
  });

  // Injection logs
  app.get("/api/injection-logs/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const medicationId = req.query.medicationId as string;
      const logs = await storage.getInjectionLogs(userId, medicationId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  app.post("/api/injection-logs", async (req, res) => {
    try {
      const data = insertInjectionLogSchema.parse(req.body);
      const log = await storage.createInjectionLog(data);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/injection-logs/:userId/count", async (req, res) => {
    try {
      const { userId } = req.params;
      const medicationId = req.query.medicationId as string;
      const count = await storage.getInjectionCount(userId, medicationId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Data imports
  app.post("/api/data-imports", upload.single("screenshot"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const data = insertDataImportSchema.parse({
        ...req.body,
        fileName: file.originalname,
        fileSize: file.size,
      });

      const importRecord = await storage.createDataImport(data);
      
      // Simulate OCR processing
      setTimeout(async () => {
        try {
          // Mock parsed data - in real app this would be OCR results
          const mockParsedData = {
            weights: [
              { date: "2024-03-19", weight: 162.5, unit: "lbs" },
              { date: "2024-03-12", weight: 165.2, unit: "lbs" },
              { date: "2024-03-05", weight: 167.5, unit: "lbs" },
            ],
            sourceApp: "detected_app_name"
          };

          await storage.updateDataImport(importRecord.id, {
            status: "completed",
            parsedData: mockParsedData
          });
        } catch (error) {
          await storage.updateDataImport(importRecord.id, {
            status: "failed",
            errorMessage: "Failed to process image"
          });
        }
      }, 2000);

      res.json(importRecord);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/data-imports/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const imports = await storage.getUserDataImports(userId);
      res.json(imports);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Demo user endpoint
  app.get("/api/demo-user", async (req, res) => {
    try {
      const demoUser = await storage.getUserByUsername("demo");
      res.json(demoUser);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Update user endpoint
  app.patch("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Update failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
