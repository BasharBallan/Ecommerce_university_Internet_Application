const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

// Supported categories matching the Mongoose schema exactly
const ALLOWED_CATEGORIES = [
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Canned',
  'Meat',
  'Poultry',
  'Fruits',
  'Vegetables',
  'Grains',
  'Oils',
  'Pantry',
  'Spices',
  'Cleaning',
  'Household',
  'Personal Care',
];

exports.createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product required')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .isLength({ max: 100 })
    .withMessage('Too long product title')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 20 })
    .withMessage('Too short product description (min 20 chars)')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Product sold must be a number'),
  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number'),

  // Custom check for imageCover since multer attaches file information or req.body.imageCover
  check('imageCover')
    .custom((_, { req }) => {
      if (!req.file && !req.body.imageCover) {
        throw new Error('Product imageCover is required');
      }
      return true;
    }),

  check('category')
    .notEmpty()
    .withMessage('Product must belong to a category')
    .isIn(ALLOWED_CATEGORIES)
    .withMessage('Invalid category value'),

  validatorMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      if (val) {
        req.body.slug = slugify(val);
      }
      return true;
    }),
  check('category')
    .optional()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage('Invalid category value'),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];
