const schedule = require('node-schedule');
const Product = require('../models/productModel');
const BarangMasuk = require('../models/barangMasukModel');
const BarangKeluar = require('../models/barangKeluarModel');

const cekTgl = function () {
    try {
        console.log('hello');
        schedule.scheduleJob('0 4 1 * *', async function () {
            let product = await Product.find();
            product.map(async (item, i) => {
                let jumlah = await BarangMasuk.find({ product: item._id, qty_masuk: { $ne: 0 } });

                //* pengecekan untuk pertama kali menambahkan 10 qty, untuk masuk bulan ke 2 atau genap
                if (jumlah.length === 0) {
                    let barangMasukTerakhir = {
                        qty_masuk: 10
                    }
                    //? Memasukan Data Pada bulan Genap
                    await _masukanDataBulanGenap(item, barangMasukTerakhir);

                    console.log('data bulan pertama telah di tambahkan');
                }
                else if (jumlah.length === 1) {

                    //* pengecekan untuk pendataan pada bulan ke 3
                    let barangMasukTerakhir = {
                        qty_masuk: 10
                    }
                    //? Memasukan Data Pada bulan Ganjil
                    await _masukanDataKeBulanGanjil(item, barangMasukTerakhir);

                    console.log('data bulan pertama telah di tambahkan untuk bln 3');
                } else if (jumlah.length > 1) {
                    let jmlhDataBarang = jumlah.length % 2;
                    let barangMasukTerakhir = await BarangMasuk.findOne({ product: item._id }).sort({ _id: -1 }).limit(1);
                    if (jmlhDataBarang === 0) {

                        //* masuk perubahan qty pada bulan ke genap, contoh : 4,6,8....
                        //? Memasukan Data Pada bulan Genap
                        await _masukanDataBulanGenap(item, barangMasukTerakhir);

                        console.log('data qty masuk pada bulan genap, jmlh qty yg masuk sama');
                    } else if (jmlhDataBarang === 1) {

                        //* masuk perubahan qty pada bulan ganjil, contoh : 5,7,9....
                        //? Memasukan Data Pada bulan Ganjil
                        await _masukanDataKeBulanGanjil(item, barangMasukTerakhir);

                        console.log('data qty masuk pada bulan ganjil, jmlh qty masuk di hitung kembali');
                    }
                }
            })
        })
    } catch (err) {
        console.error(err);
    }
}

//!==============================
const _masukanDataKeBulanGanjil = async (item, barangMasukTerakhir) => {
    let date = new Date();
    let bln = date.getMonth();
    let thn = date.getFullYear();
    let jual = 0;
    let kondisiBln = bln - 1 === 0 ? 12 : bln - 1;
    let barangKeluar;
    if (kondisiBln === 12) {
        let barang = [];
        let data1 = await BarangKeluar.find(
            {
                $and: [
                    {
                        product: item._id,
                        tgl_keluar: {
                            $gte: `${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-1`,
                            $lte: `${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-31`
                        },
                    }
                ]
            }
        );
        let data2 = await BarangKeluar.find(
            {
                $and: [
                    {
                        product: item._id,
                        tgl_keluar: {
                            $gte: `${thn}-${bln}-1`,
                            $lte: `${thn}-${bln}-31`
                        },
                    }
                ]
            }
        );
        data1.map((tem, i) => {
            barang.push(tem);
        });
        data2.map((tem, i) => {
            barang.push(tem);
        });
        barangKeluar = barang;
    } else {
        barangKeluar = await BarangKeluar.find(
            {
                $and: [
                    {
                        product: item._id,
                        tgl_keluar: {
                            $gte: `${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-1`,
                            $lte: `${thn}-${bln}-31`
                        },
                    }
                ]
            }
        );
    }
    barangKeluar.map((tem, j) => {
        jual = jual + tem.qty_keluar
    });
    let qty = _prosesPerhitungan(parseInt(barangMasukTerakhir.qty_masuk), parseInt(barangMasukTerakhir.qty_masuk), jual);
    date = new Date();
    let tgl = date.getDate();
    bln = date.getMonth();
    thn = date.getFullYear();
    let data = {
        qty_sebelum: 0,
        qty_masuk: qty,
        product: item._id,
        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
    }
    await Product.findByIdAndUpdate(item._id, { qty: qty });
    let barang = new BarangMasuk(data);
    await barang.save();
}

//!==============================
const _masukanDataBulanGenap = async (item, barangMasukTerakhir) => {
    let date = new Date();
    let tgl = date.getDate();
    let bln = date.getMonth();
    let thn = date.getFullYear();
    let data = {
        qty_sebelum: item.qty,
        qty_masuk: parseInt(barangMasukTerakhir.qty_masuk),
        product: item._id,
        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
    }
    await Product.findByIdAndUpdate(item._id, { qty: (item.qty + parseInt(barangMasukTerakhir.qty_masuk)) });
    let barang = new BarangMasuk(data);
    await barang.save();
}

//!==============================
const _prosesPerhitungan = (qty1, qty2, jual) => {
    let qty = (parseFloat(qty1) + parseFloat(qty2) - parseFloat(jual)) / 2;
    return parseInt(qty);
}
// const tambahQty = async () => {

// }

module.exports = { cekTgl };