const mongoose = require('mongoose');
const { model, Schema } = mongoose;

let recordAksiSchema = Schema({
    // qty_sebelum: {
    //     required: [true, "Qty Sebelum Harus Diisi"],
    //     type: Number,
    //     default: 0
    // },
    qty: {
        required: [true, "Qty Masuk Harus Diisi"],
        type: Number,
    },

    // metode: {
    //     type: String,
    // },

    // price_product: {
    //     required: [true, "Harga Product Harus Diisi"],
    //     type: Number,
    //     default: 0
    // },

    tahun_bulan: String,

    tgl_update: String,

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true });

module.exports = model('RecordAksi', recordAksiSchema);