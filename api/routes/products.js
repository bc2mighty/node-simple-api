const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const checkAuth = require("../middleware/check-auth.js")

const multer = require("multer")

const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, "./uploads/")
  },
  filename(req, file, cb){
    cb(null, new Date().toISOString() + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if(file.mimeType === "image/png" || file.mimeType === "image/jpeg" || file.mimeType === "image/jpg"){
    cb(null, false)
  }else{
    cb(null, true)
  }
}

const Product = require("../models/product")
const upload = multer(
  {
    storage: storage,
    limits:{
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  }
)

router.get("/", async(req, res, next) => {
    await Product.find()
    .select("_id name price productImage")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        product: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id
            }
          }
        })
      }

      if(docs.length > 0){
        res.status(200).json(response)
      }else{
        res.status(404).json({
          message: "No entries found in the database"
        })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
})

router.post("/", checkAuth, upload.single('productImage'), async(req, res, next) => {
    console.log(req.file)

    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price,
      productImage: req.file.path
    })

    await product
      .save()
      .then(result => {
        console.log(result)
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
              name: result.name,
              price: result.price,
              _id: result._id,
              request: {
                type: "GET",
                url: "http://localhost:3000/products/" + result._id
              }
            }
        })
      })
      .catch(err =>{
        console.log(err)
        res.status(200).json({
          error: err
        })
      })
})

router.get("/:productId", checkAuth, async(req, res, next) => {
    const id = req.params.productId
    await Product.findById(id)
      .select("_id name price productImage")
      .exec()
      .then(doc => {
        console.log(doc)
        if(doc){
          res.status(200).json({
              product:{
                name: doc.name,
                price: doc.price,
                productImage: doc.productImage,
                _id: doc._id
              },
              request: {
                type: "GET",
                url: "http://localhost:3000/products/" + doc._id
              }
          })
        }else{
          res.status(404).json({message:"No valid entry found for the provided ID"})
        }
      })
      .catch(err => {
        res.status(200).json({error: err})
        console.log(err)
      })
})

router.patch("/:productId", checkAuth, async(req, res, next) => {
    const id = req.params.productId
    const updateOps = {}

    for (const ops of req.body){
      updateOps[ops.propName] = ops.value
    }

    await Product.update({_id: id}, {$set: updateOps})
      .exec()
      .then(result => {
        console.log(result)
        res.status(200).json({
          message: "Product Updated",
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + id
          }
        })
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({
          error: err
        })
      })
})

router.delete("/:productId", checkAuth, async(req, res, next) => {
    const id = req.params.productId
    await Product.remove({_id: id}).exec()
      .then(result => {
        res.status(200).json({
          message: "Product Deleted",
          request: {
            type: "POST",
            url: "http://localhost:3000/products",
            data: {name: "String", price: "Number"}
          }
        })
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({
          error: err
        })
      })
})

module.exports = router
