const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Too short product title'],
      maxlength: [100, 'Too long product title'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Too short product description'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      max: [200000, 'Too long product price'],
    },
    imageCover: {
      type: String,
      required: [true, 'Product Image cover is required'],
    },
    category: {
      type: String,
      required: [true, 'Product must belong to a category'],
      enum: {
        values: [
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
        ],
        message: 'Category is not supported',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// توليد الـ slug تلقائياً من الـ title قبل الحفظ
productSchema.pre('save', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const setImageURL = (doc) => {
  if (doc.imageCover && !doc.imageCover.startsWith('http')) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};

productSchema.post('init', (doc) => {
  setImageURL(doc);
});

productSchema.post('save', (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model('Product', productSchema);
