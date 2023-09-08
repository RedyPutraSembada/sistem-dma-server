const mongoose = require('mongoose');
const { model, Schema } = mongoose;

let barangMasukSchema = Schema({
    qty_sebelum: {
        required: [true, "Qty Sebelum Harus Diisi"],
        type: Number,
        default: 0
    },
    qty_masuk: {
        required: [true, "Qty Masuk Harus Diisi"],
        type: Number,
        default: 0
    },

    qty_masuk_sebelumnya: {
        type: Number,
        default: 0
    },

    total_qty_masuk: {
        required: [true, "Qty Masuk Harus Diisi"],
        type: Number,
        default: 0
    },

    active: {
        type: Number,
        default: 1
    },

    tgl_masuk: String,

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true });

module.exports = model('BarangMasuk', barangMasukSchema);