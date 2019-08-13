const mongoose = require("mongoose")

const Order = require("../models/order")
const Product = require("../models/product")

exports.order_gets_all = async(req, res, next) => {
    await Order
      .find()
      .populate("product","name price _id")
      .exec()
      .then(docs => {
        res.status(200).json({
          count: docs.length,
          orders: docs.map(doc => {
            return {
              id: doc._id,
              quantity: doc.quantity,
              product: doc.product,
              request: {
                type: "GET",
                url: "http://localhost:3000/orders/" + doc._id
              }
            }
          })
        })
      })
      .catch(err => {
        res.status(500).json({
          error: err
        })
      })
  }

exports.orders_create_order = async(req, res, next) => {
    await Product.findById(req.body.productId)
      .then(product => {
          if(!product){
            return res.status(404)
              .json({
                message: "Product not found"
              })
          }
          const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
          })
          return order .save()
      })
      .then(result => {
        console.log(result)
        res.status(200).json({
          message: "Order created successfully",
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + result._id
            }
          }
        })
      })
      .catch(err => {
        console.log(err)
        res.status(500)
          .json({error: err})
      })
}

exports.orders_get_order = async(req, res, next) => {
    await Order.findById(req.params.orderId)
      .populate("product","name price _id")
      .select("_id quantity product")
      .exec()
      .then(order => {
        if(!order){
          res.status(404).json({
            message: "Order not found"
          })
        }
        res.status(200).json({
            message: "Order Details",
            order: order,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + order._id
            }
        })
      })
      .catch(err => {
          res.status(500).json({
              error: err
          })
      })
}

exports.orders_delete_order = async(req, res, next) => {
    await Order.remove({_id: req.params.orderId})
      .exec()
      .then(result => {
        res.status(200).json({
            message: "Order Deleted",
            request: {
              url: "http://localhost:3000/orders",
              type: "POST",
              body: {
                product: "String", quantity: "Number"
              }
            }
        })
      })
}
