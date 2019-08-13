const express = require("express")
const router = express.Router()

const checkAuth = require("../middleware/check-auth.js")

const OrdersController = require("../controllers/order")

router.get("/", checkAuth, OrdersController.order_gets_all)

router.post("/", checkAuth, OrdersController.orders_create_order)

router.get("/:orderId", checkAuth, OrdersController.orders_get_order)

router.delete("/:orderId", checkAuth, OrdersController.orders_delete_order)

module.exports = router
