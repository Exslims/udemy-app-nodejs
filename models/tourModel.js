const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal 40 characters',
            ],
            minlength: [
                10,
                'A tour name must have more or equal 10 characters',
            ],
            // validate: [
            //     validator.isAlpha,
            //     'Tour name must contains only characters',
            // ],
        },
        slug: {
            type: String,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a maxGroupSize'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below or equal 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                message: 'Discount price ({VALUE}) should be below price',
                validator: function (val) {
                    // working only in create
                    return val < this.price;
                },
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre('save', function (next) {
//     console.log('Will save document...');
//     next();
// });
//
// // DOCUMENT MIDDLEWARE: runs after .save() and .create()
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} ms`);
    console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {
            secretTour: { $ne: true },
        },
    });
    console.log(this);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
