const BarangMasuk = require('../models/barangMasukModel');
const BarangKeluar = require('../models/barangKeluarModel');
const Product = require('../models/productModel');

const index = async (req, res, next) => {
    const barangKeluar = await BarangKeluar.find();
    const product = await Product.find();
    const arr = [];
    const kelompokProduct = [];
    barangKeluar.forEach(element => {
        arr.push(element.tgl_keluar);
    });
    const tglUniq = [...new Set(arr)];


    product.forEach(element => {
        kelompokProduct.push({
            name: element.name,
            _id: element._id,
            type: 'area',
            fill: 'gradient',
            data: []
        })
    });
    console.log(kelompokProduct);
    kelompokProduct.forEach(element => {
        const d = [];
        barangKeluar.forEach(async elem => {
            if (element._id === elem.product._id) {
                if (d.length === 0) {
                    const date = new Date(elem.tgl_keluar);
                    d.push({
                        tgl: `${date.getFullYear()}-${date.getMonth() + 1}`,
                        qty: elem.qty_sebelum - elem.qty_keluar
                    });
                } else {
                    d.forEach(el => {
                        const date = new Date(elem.tgl_keluar);
                        if (el.tgl === `${date.getFullYear()}-${date.getMonth() + 1}`) {
                            const q = el.qty;
                            console.log(`${q} - ${elem.qty_keluar}`);
                            el.qty = q - elem.qty_keluar;
                        }
                    });
                }
            }
        });
        console.log(d);
    });
    res.json(kelompokProduct);
}

module.exports = {
    index
}