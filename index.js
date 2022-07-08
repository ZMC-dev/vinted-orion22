const express = require("express");
const mongoose = require("mongoose");

//connexion à la bdd
mongoose.connect("mongodb://localhost/vinted-orion22");

//variable du serveur
const app = express();
app.use(express.json());

//import des routes users et offers
const usersRoutes = require("./routes/users");
app.use(usersRoutes);
const offersRoutes = require("./routes/offers");
app.use(offersRoutes);

//route introuvable
app.all("*", (req, res) => {
  res.status(400).json("Route introuvable");
});

//appel au serveur
app.listen(3001, () => {
  console.log("Server has started ! ");
});
