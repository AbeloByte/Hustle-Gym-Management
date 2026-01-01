const express = require("express");
const app = express();

app.use(express.json()); // allows JSON body parsing

app.get("/", (req, res) => {
  res.send("Welcome to my Express API");
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
