import { Express } from "express";
import { createServer, Server } from "http";
import authRoutes from "./auth";
import clientsRoutes from "./clients";
import projectsRoutes from "./projects";
import tasksRoutes from "./tasks";
import bookingsRoutes from "./bookings";
import eventsRoutes from "./events";
import aiRoutes from "./ai";
import calendarRoutes from "./calendar";
import linkRoutes from "./links";
import { registerPublicProfileRoutes } from "./publicProfile";
import { registerRoutes as legacyRoutes } from "./legacy";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRoutes);
  app.use("/api/clients", clientsRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/tasks", tasksRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/calendar", calendarRoutes);
  app.use("/api/links", linkRoutes);

  // Mount legacy routes for remaining endpoints
  await legacyRoutes(app);

  registerPublicProfileRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}

export default registerRoutes;
