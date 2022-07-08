const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

cloudinary.config({
  cloud_name: "dynxmylaf",
  api_key: "171732946366797",
  api_secret: "GnjWEHHR1sZ5RxfccenHEqBIYhU",
});

const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");

// fonction pour converir un fichier photo en base64
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//publication d'une offre
router.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
  try {

console.log("creation d'offre");
    console.log(req.body);
    console.log(req.files);
    const newOffer = new Offer({
      product_name: req.body.title,
      product_description: req.body.description,
      product_price: req.body.price,
      product_details: [
        { MARQUE: req.body.brand },
        { TAILLE: req.body.size },
        { ETAT: req.body.condition },
        { COULEUR: req.body.color },
        { EMPLACEMENT: req.body.city },
      ],
      owner: req.user,
    });


    //envoi d'image sur cloudinary après création en DB de l'offre
    const result = await cloudinary.uploader.upload(
      convertToBase64(req.files.picture),
      {
        folder: "vinted/offers",
        public_id: `${req.body.title} - ${newOffer._id}`,
      }
    );
    //ajout image à l'annonce
    newOffer.product_image = result;

    await newOffer.save();

    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//listing d'offres existantes
router.get("/offers", async (req, res) => {
  const filtersObject = {};

  if (req.query.title) {
    filtersObject.product_name = new RegExp(req.query.title, "i");
  }

  if (req.query.priceMin) {
    filtersObject.product_price = { $gte: req.query.priceMin };
  }

  //Si j'ai une déjà une clé product_price dans mon object objectFilter
  if (req.query.priceMax) {
    if (filtersObject.product_price) {
      filtersObject.product_price.$lte = req.query.priceMax;
    } else {
      filtersObject.product_price = { $lte: req.query.priceMax };
    }
  }

  //gestion du tri avec l'objet sortObject
  const sortObject = {};

  if (req.query.sort === "price-desc") {
    sortObject.product_price = "desc";
  } else if (req.query.sort === "price-asc") {
    sortObject.product_price = "asc";
  }

  //gestion de la pagination
  let limit = 3;
  if (req.query.limit) {
    limit = req.query.limit;
  }

  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const offers = await Offer.find(filtersObject)
    .sort(sortObject)
    .select("product_name product_price")
    .limit(limit)
    .skip((page - 1) * limit);

  const count = await Offer.countDocuments(filtersObject);

  res.json({ count: count, offers: offers });

});

// récuperer l'id avec une requête params 
// faut toujours ajouter : avant le paramètre à récuperer
router.get("/offer/:id", async (req, res) => {
  console.log(req.params);
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});


// route pour modifier offre
router.post("/offer/modify", isAuthenticated, fileUpload, async (req, res) =>
{

});

// route pour supprimer l'offre
router.post("/offer/delete", isAuthenticated, fileUpload, async (req, res) =>
{

}); 


module.exports = router;

