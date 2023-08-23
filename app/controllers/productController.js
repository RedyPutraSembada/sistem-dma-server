const path = require('path');
const fs = require('fs');
const config = require('../config');
const Product = require('../models/productModel');
const BarangKeluar = require('../models/barangKeluarModel');
const BarangMasuk = require('../models/barangMasukModel');

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);

            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on('end', async () => {
                try {
                    let product = new Product({ ...payload, image_url: filename });
                    await product.save();
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path);
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }
                    next(err);
                }
            });

            //* Ketika upload error
            src.on('error', async () => {
                next(err);
            });
        } else {
            console.log(payload);
            let product = new Product(payload);
            await product.save();
            return res.json(product);
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

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10, q = '' } = req.query;

        let criteria = {};

        if (q.length) {
            criteria = {
                ...criteria,
                name: { $regex: `${q}`, $options: 'i' }
            }
        }

        let product = await Product.find(criteria).skip(parseInt(skip)).limit(parseInt(limit));
        return res.json({
            data: product,
        })
    } catch (err) {
        next(err);
    }
}

const update = async (req, res, next) => {
    try {
        let payload = req.body;
        let { id } = req.params;

        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);

            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on('end', async () => {
                try {
                    let product = await Product.findById(id);
                    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

                    if (fs.existsSync(currentImage)) {
                        fs.unlinkSync(currentImage);
                    }
                    product = await Product.findByIdAndUpdate(id, { ...payload, image_url: filename }, { new: true, runValidators: true });
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path);
                    if (err && err.name === "ValidationError") {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        });
                    }

                    next(err);
                }
            });

            //* jika upload error
            src.on('error', async () => {
                next(err)
            })
        } else {
            let product = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
            return res.json(product);
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

const destroy = async (req, res, next) => {
    try {
        const { id } = req.params;
        let product = await Product.findByIdAndDelete(id);
        let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
        if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
        }
        return res.json(product);
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

const updateQtyKeluar = async (req, res, next) => {
    try {
        let { id } = req.params;
        let { qty } = req.body;
        let product = await Product.findById(id);
        let qtySblm = product.qty;
        product = await Product.findByIdAndUpdate(id, { qty: qtySblm - parseInt(qty) });
        let date = new Date();
        let tgl = date.getDate();
        let bln = date.getMonth();
        let thn = date.getFullYear();
        date = new Date(`${thn}-${bln + 1}-${tgl}`);
        let data = {
            product: id,
            qty_sebelum: qtySblm,
            qty_keluar: parseInt(qty),
            tgl_keluar: `${thn}-${bln + 1}-${tgl}`,
            price_product: product.price
        }
        let barangKeluar = new BarangKeluar(data);
        await barangKeluar.save();
        return res.json(barangKeluar);
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

const updateQtyMasuk = async (req, res, next) => {
    try {
        let { id } = req.params;
        let { qty } = req.body;
        product = await Product.findByIdAndUpdate(id, { qty: parseInt(qty) });
        let date = new Date();
        let tgl = date.getDate();
        let bln = date.getMonth();
        let thn = date.getFullYear();
        let data = {
            product: id,
            qty_sebelum: 0,
            qty_masuk: parseInt(qty),
            tgl_masuk: `${thn}-${bln + 1}-${tgl}`,
        }
        let barangMasuk = new BarangMasuk(data);
        await barangMasuk.save();
        return res.json(barangMasuk);
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


module.exports = {
    store,
    index,
    update,
    destroy,
    updateQtyKeluar,
    updateQtyMasuk,
}