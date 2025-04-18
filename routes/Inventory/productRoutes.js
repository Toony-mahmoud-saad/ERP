const express = require('express');
const router = express.Router();
const productController = require('../../controllers//Inventory/productController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, productController.getAllProducts)
  .post(authorize, productController.createProduct);

router.route('/:id')
  .get(authorize, productController.getProductById)
  .put(authorize, productController.updateProduct)
  .delete(authorize, productController.deleteProduct);

router.get('/reports/summary', authorize, productController.getInventorySummary);
router.get('/reports/top-selling', authorize, productController.getTopSellingProducts);
router.get('/reports/non-selling', authorize, productController.getNonSellingProducts);

module.exports = router;