import { Context } from "hono";
import { logger } from "../utils/logger";

export const errorHandler = (err: Error, c: Context) => {
  logger.error("Unhandled exception: ", err);

  const status = (err as any).status || 500;
  const message = err.message || "Internal Server Error";

  return c.json(
    {
      success: false,
      error: message,
    },
    status
  );
};
