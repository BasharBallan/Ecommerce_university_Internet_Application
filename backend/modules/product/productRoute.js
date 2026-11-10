const express = require('express');
const { getProduct, getProducts, invalidateCache } = require('./productController');

const router = express.Router();

router.route('/')
  .get(getProducts);

router.route('/:id')
  .get(getProduct);

router.route('/:id/invalidate-cache')
  .post(invalidateCache);

module.exports = router;

