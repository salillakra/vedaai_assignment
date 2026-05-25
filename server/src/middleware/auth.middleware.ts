import { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: "Unauthorized: Missing or invalid token",
      },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  if (token === "valid-mock-token" || token.length > 10) {
    c.set("user", { id: "mock-user-id", role: "user" });
    await next();
  } else {
    return c.json(
      {
        success: false,
        error: "Unauthorized: Invalid signature",
      },
      401
    );
  }
};
