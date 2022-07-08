const mongoose = require("mongoose");

const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  //   console.log(req.headers);
  // Cette condition sert à vérifier si j'envoie un token
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    // Cette condition sert à vérifier si j'envoie un token valide !

    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: "Existing token but invalid acces!" });
    }
  } else {
    res.status(401).json({ error: " Unsent token !" });
  }
};

module.exports = isAuthenticated;