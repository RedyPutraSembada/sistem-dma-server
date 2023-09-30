const path = require('path');
const fs = require('fs');
const config = require('../config');
const Product = require('../models/productModel');
const BarangKeluar = require('../models/barangKeluarModel');
const BarangMasuk = require('../models/barangMasukModel');
const RecordAksi = require('../models/recordAksiModel');

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        let date = new Date();
        let tgl = date.getDate();
        let bln = date.getMonth();
        let thn = date.getFullYear();

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
                    let brngMasuk = {
                        qty_sebelum: 0,
                        qty_masuk: payload.qty,
                        qty_masuk_sebelumnya: 0,
                        tahun_bulan: `${thn}-${bln + 1}`,
                        total_qty_masuk: payload.qty,
                        active: 1,
                        product: product._id,
                        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
                    }
                    let barangMasuk = new BarangMasuk(brngMasuk);
                    let rcrdAksi = {
                        qty: payload.qty,
                        tahun_bulan: `${thn}-${bln + 1}`,
                        tgl_update: `${thn}-${bln + 1}-${tgl}`,
                        product: product._id
                    }
                    let recordAksi = new RecordAksi(rcrdAksi);
                    await product.save();
                    await barangMasuk.save();
                    await recordAksi.save();
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
            let product = new Product(payload);
            let brngMasuk = {
                qty_sebelum: 0,
                qty_masuk: payload.qty,
                qty_masuk_sebelumnya: 0,
                total_qty_masuk: payload.qty,
                active: 1,
                product: product._id,
                tgl_masuk: `${thn}-${bln + 1}-${tgl}`
            }
            let barangMasuk = new BarangMasuk(brngMasuk);
            let rcrdAksi = {
                qty: 10,
                tahun_bulan: `${thn}-${bln + 1}`,
                tgl_update: `${thn}-${bln + 1}-${tgl}`,
                product: product._id
            }
            let recordAksi = new RecordAksi(rcrdAksi);
            await product.save();
            await barangMasuk.save();
            await recordAksi.save();
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

        let rcdAks = await RecordAksi.find({ product: id, tahun_bulan: `${thn}-${bln + 1}` });
        if (rcdAks.length > 0) {
            let rcrdAksi = {
                qty: rcdAks[0].qty - parseInt(qty),
                tahun_bulan: `${thn}-${bln + 1}`,
                tgl_update: `${thn}-${bln + 1}-${tgl}`,
                product: product._id
            }
            await RecordAksi.deleteOne({ product: id, tahun_bulan: `${thn}-${bln + 1}` });
            let recordAksi = new RecordAksi(rcrdAksi);
            await recordAksi.save();
        } else if (rcdAks.length === 0) {
            let rcrdAksi = {
                qty: qtySblm - parseInt(qty),
                tahun_bulan: `${thn}-${bln + 1}`,
                tgl_update: `${thn}-${bln + 1}-${tgl}`,
                product: product._id
            }
            let recordAksi = new RecordAksi(rcrdAksi);
            await recordAksi.save();
        }

        // let rcdAks = await RecordAksi.find({ product: id, tahun_bulan: `${thn}-${bln + 1}` });
        let brngkeluar = await BarangKeluar.findOne({ product: id, tahun_bulan: `${thn}-${bln + 1}`, active: 1 }).sort({ createdAt: -1 }).limit(1);
        let qty_keluar_sebelumnya = brngkeluar === null ? 0 : brngkeluar.qty_keluar;
        let total_qty_keluar = brngkeluar === null ? 0 + parseInt(qty) : brngkeluar.total_qty_keluar + parseInt(qty);
        // console.log(qty_keluar_sebelumnya, total_qty_keluar);
        let data = {
            product: id,
            qty_sebelum: qtySblm,
            active: 1,
            tahun_bulan: `${thn}-${bln + 1}`,
            qty_keluar: parseInt(qty),
            price_product: product.price,
            qty_keluar_sebelumnya: qty_keluar_sebelumnya,
            total_qty_keluar: total_qty_keluar,
            tgl_keluar: `${thn}-${bln + 1}-${tgl}`,
        }

        if (brngkeluar !== null) {
            brngkeluar.active = 0;
            await brngkeluar.save();
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
        let product = await Product.findById(id);
        let qtySblm = product.qty;
        product = await Product.findByIdAndUpdate(id, { qty: parseInt(qty) });
        let date = new Date();
        let tgl = date.getDate();
        let bln = date.getMonth();
        let thn = date.getFullYear();

        let rcdAks = await RecordAksi.find({ product: id, tahun_bulan: `${thn}-${bln + 1}` });
        if (rcdAks.length > 0) {
            let rcrdAksi = {
                qty: rcdAks[0].qty + parseInt(qty),
                tahun_bulan: `${thn}-${bln + 1}`,
                tgl_update: `${thn}-${bln + 1}-${tgl}`,
                product: product._id
            }
            await RecordAksi.deleteOne({ product: id, tahun_bulan: `${thn}-${bln + 1}` });
            let recordAksi = new RecordAksi(rcrdAksi);
            await recordAksi.save();
        } else if (rcdAks.length === 0) {
            let rcrdAksi = {
                qty: qtySblm + parseInt(qty),
                tahun_bulan: `${thn}-${bln + 1}`,
                tgl_update: `${thn}-${bln + 1}-${tgl}`,
                product: product._id
            }
            let recordAksi = new RecordAksi(rcrdAksi);
            await recordAksi.save();
        }
        let brngMasuk = await BarangMasuk.findOne({ product: id, tahun_bulan: `${thn}-${bln + 1}`, active: 1 }).sort({ createdAt: -1 }).limit(1);
        // console.log(brngMasuk);
        let qty_masuk_sebelumnya = brngMasuk === null ? 0 : brngMasuk.qty_masuk;
        let total_qty_masuk = brngMasuk === null ? 0 + parseInt(qty) : brngMasuk.total_qty_masuk + parseInt(qty);

        let data = {
            product: id,
            qty_sebelum: 0,
            active: 1,
            qty_masuk: parseInt(qty),
            qty_masuk_sebelumnya: qty_masuk_sebelumnya,
            total_qty_masuk: total_qty_masuk,
            tgl_masuk: `${thn}-${bln + 1}-${tgl}`,
        }
        brngMasuk.active = 0;
        await brngMasuk.save();
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