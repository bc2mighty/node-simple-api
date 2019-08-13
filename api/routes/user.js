const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("../models/user");

router.get("/", async(req, res, next) => {
    await User.find()
      .exec()
      .then(users => {
          res.status(200)
            .json({
              users: users
          })
      })
      .catch(err => {
          res.status(401)
            .json({
                error: err
            })
      })
})

router.post('/login', async(req, res, next) => {
    await User.find({email: req.body.email})
    .then(user => {
        if(user.length < 1){
            res.status(401)
              .json({
                  message: "Auth Failed"
              })
        }else{
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if(err){
                    return res.status(401).json({
                        message: "Auth Failed"
                    })
                }
                if(result){
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    },
                    process.env.JWT_KEY,
                    {expiresIn: "1h"})
                    return res.status(401).json({
                        message: "Auth Successful",
                        token: token
                    })
                }
                return res.status(401).json({
                    message: "Auth Failed"
                })
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        })
    })
})

router.post("/signup", async(req, res, next) => {
  await User.find({email: req.body.email})
    .exec()
    .then(user => {
      if(user.length >= 1){
        return res.status(409).json({
          message: "Mail Exists"
        })
      }else{

        bcrypt.hash(req.body.password, 10)
          .then(hash => {
              if(hash){
                const user = new User({
                  _id: new mongoose.Types.ObjectId,
                  email: req.body.email,
                  password: hash
                })
                user
                  .save()
                  .then(result => {
                    res.status(200).json({
                      message: "User Created"
                    })
                  })
                  .catch(err => {
                    console.log(err)
                    return res.status(500).json({
                      message:"Error There",
                      error: err
                    })
                  })
              }else{
                  return res.status(200).json({
                      message: "User Password Not Hashed",
                      error: err
                  })
            }
          })
          .catch(err => {
              return res.status(200).json({
                  message: "User Password Not Hashed",
                  error: err
              })
          })
          /*
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if(err){
            console.log(err);
            console.log(req.body.password);
            return res.status(500).json({
              message:"Error Here",
              error: err
            })
          }else{
            const user = new User({
              _id: new mongoose.Types.ObjectId,
              email: req.body.email,
              password: hash
            })
            user
              .save()
              .then(result => {
                res.status(200).json({
                  message: "User Created"
                })
              })
              .catch(err => {
                console.log(err)
                return res.status(500).json({
                  message:"Error There",
                  error: err
                })
              })
          }
        })
        */
      }
    })
})

router.delete("/:userId", async(req, res, next) => {
  await User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

module.exports = router;
