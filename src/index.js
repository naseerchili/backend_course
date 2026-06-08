import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}`);
    });

    const gracefulShutdown = () => {
      console.log("\nShutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1);
  });
