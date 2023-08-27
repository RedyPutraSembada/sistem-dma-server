const BarangKeluar = require('../models/barangKeluarModel');
const index = async (req, res, next) => {
    const { start, end } = req.query;
    try {
        if (start === 'null' || end === 'null') {
            let barang = await BarangKeluar.find().populate("product");
            return res.json({
                data: barang
            });
        } else {
            const dates = new Date(start);
            const tgls = dates.getDate();
            const months = dates.getMonth();
            const years = dates.getFullYear();
            const konsdisiBlns = months === 0 ? 1 : months + 1;
            const datee = new Date(end);
            const tgle = datee.getDate();
            const monthe = datee.getMonth();
            const yeare = datee.getFullYear();
            const konsdisiBlne = monthe === 0 ? 1 : monthe + 1;
            let barang = await BarangKeluar.find({
                tgl_keluar: {
                    $gte: `${years}-${konsdisiBlns}-${tgls}`,
                    $lte: `${yeare}-${konsdisiBlne}-${tgle}`
                }
            }
            ).populate("product");
            return res.json({
                data: barang
            });
            // console.log(barang);
        }
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

module.exports = { index }