import { Server } from "socket.io";
import { logger } from "../utils/logger";

export class SocketManager {
  private static io: Server | null = null;

  static init(io: Server) {
    this.io = io;
    logger.info("SocketManager initialized with Socket.io server.");

    io.on("connection", (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // client joins room to track assignment progress
      socket.on("join:assignment", (assignmentId: string) => {
        if (assignmentId) {
          socket.join(`assignment_${assignmentId}`);
          logger.info(`Socket ${socket.id} joined room: assignment_${assignmentId}`);
          
          // acknowledge join
          socket.emit("joined:assignment", { assignmentId });
        }
      });

      socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  static emitToAssignment(assignmentId: string, event: string, payload: any) {
    if (this.io) {
      logger.info(`Emitting event '${event}' to room 'assignment_${assignmentId}'`);
      this.io.to(`assignment_${assignmentId}`).emit(event, payload);
    } else {
      logger.warn("SocketManager not initialized. Socket event skipped.");
    }
  }

  static broadcast(event: string, payload: any) {
    if (this.io) {
      logger.info(`Broadcasting global event: ${event}`);
      this.io.emit(event, payload);
    } else {
      logger.warn("SocketManager not initialized. Broadcast event skipped.");
    }
  }
}
