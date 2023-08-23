const mongoose = require('mongoose');
const { model, Schema } = mongoose;

let productSchema = Schema({
    name: {
        type: String,
        required: [true, "Nama Product Harus Diisi"],
        maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
        minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
    },
    description: {
        type: String,
        required: [true, "Deskripsi Product Harus Diisi"],
        maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
        minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
    },

    image_url: String,

    price: {
        required: [true, "Harga Product Harus Diisi"],
        type: Number,
        default: 0
    },

    qty: {
        required: [true, "Quantity Product Harus Diisi"],
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = model('Product', productSchema);