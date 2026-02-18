import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB, { isDatabaseReady } from "./src/config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.warn(
      "Backend started without database. DB-backed endpoints will return 503 until MongoDB is reachable."
    );
  }

  app.listen(PORT, () => {
    console.log(`Flick Deck backend running on http://localhost:${PORT}`);
  });

  // Keep trying to reconnect while backend is running.
  setInterval(() => {
    if (!isDatabaseReady()) {
      connectDB();
    }
  }, 15000).unref();
};

startServer();
