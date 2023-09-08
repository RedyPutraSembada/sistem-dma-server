const mongoose = require('mongoose');
const { model, Schema } = mongoose;

let barangKeluarSchema = Schema({
    qty_sebelum: {
        required: [true, "Qty Sebelum Harus Diisi"],
        type: Number,
        default: 0
    },
    qty_keluar: {
        required: [true, "Qty Masuk Harus Diisi"],
        type: Number,
        default: 0
    },

    qty_keluar_sebelumnya: {
        type: Number,
        default: 0
    },

    total_qty_keluar: {
        required: [true, "Qty Masuk Harus Diisi"],
        type: Number,
        default: 0
    },

    active: {
        type: Number,
        default: 1
    },

    tgl_keluar: String,

    price_product: {
        required: [true, "Harga Product Harus Diisi"],
        type: Number,
        default: 0
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true });

module.exports = model('BarangKeluar', barangKeluarSchema);