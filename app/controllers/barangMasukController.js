const BarangMasuk = require('../models/barangMasukModel');

const index = async (req, res, next) => {
    try {
        let barang = await BarangMasuk.find().populate('product');
        return res.json({
            data: barang
        })
    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }
}

module.exports = { index };