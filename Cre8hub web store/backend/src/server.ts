import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE FIRST

import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
