const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");

app.use(bodyParser.json()); // untuk parse JSON di request body

// Menyambungkan endpoint /register dengan router auth
app.use("/", authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
