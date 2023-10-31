const schedule = require('node-schedule');
const Product = require('../models/productModel');
const BarangMasuk = require('../models/barangMasukModel');
const BarangKeluar = require('../models/barangKeluarModel');
const RecordAksi = require('../models/recordAksiModel');

const cekTgl = function () {
    try {
        console.log('hello');
        schedule.scheduleJob('0 4 1 * *', async function () {
            let product = await Product.find();
            product.map(async (item, i) => {
                let jumlah = await BarangMasuk.find({ product: item._id, qty_masuk: { $ne: 0 }, active: 1 });

                //* pengecekan untuk pertama kali menambahkan qty berdasarkan input sebelumnya, pendataan bulan ke 1 untuk masuk bulan ke bulan ke 2
                if (jumlah.length === 1) {
                    let data = await BarangMasuk.findOne({ product: item._id, qty_masuk: { $ne: 0 }, active: 1 }).limit(1);
                    // console.log(data);
                    // console.log("1");
                    let barangMasukTerakhir = {
                        total_qty_masuk: data.total_qty_masuk
                    }
                    let rcdAks = await RecordAksi.findOne({ product: item._id }).limit(1);
                    // console.log(rcdAks);
                    //? Memasukan Data Pada bulan ke1
                    await _masukanDataQtySama(item, barangMasukTerakhir, rcdAks);

                    console.log('data bulan pertama telah di tambahkan');
                }
                else if (jumlah.length === 2) {
                    let data = await BarangMasuk.findOne({ product: item._id, qty_masuk: { $ne: 0 }, active: 1 }).sort({ createdAt: -1 }).limit(1);

                    //* pengecekan untuk pendataan pada bulan ke 3
                    let barangMasukTerakhir = {
                        total_qty_masuk: data.total_qty_masuk
                    }

                    let rcdAks = await RecordAksi.findOne({ product: item._id }).sort({ createdAt: -1 }).limit(1);
                    // console.log(data);
                    // console.log(rcdAks);
                    //? Memasukan Data Pada bulan kedua
                    await _masukanDataQtySama(item, barangMasukTerakhir, rcdAks);

                    console.log('data bulan kedua telah di tambahkan');
                } else if (jumlah.length > 2) {
                    let jmlhDataBarang = jumlah.length % 2;
                    let barangMasukTerakhir = await BarangMasuk.findOne({ product: item._id, active: 1 }).sort({ _id: -1 }).limit(1);
                    if (jmlhDataBarang === 0) {

                        //* masuk perubahan qty pada bulan ke genap, contoh : 4,6,8....
                        //? Memasukan Data Pada bulan Genap
                        await _masukanDataQtySama(item, barangMasukTerakhir);

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
const _masukanDataQtySama = async (item, barangMasukTerakhir, rcdAks) => {
    console.log(item);
    console.log(barangMasukTerakhir);
    console.log(rcdAks);
    let date = new Date();
    let tgl = date.getDate();
    let bln = date.getMonth();
    let thn = date.getFullYear();
    let data = {
        qty_sebelum: item.qty,
        qty_masuk: parseInt(barangMasukTerakhir.total_qty_masuk),
        qty_masuk_sebelumnya: 0,
        total_qty_masuk: parseInt(barangMasukTerakhir.total_qty_masuk) + parseInt(rcdAks.qty),
        product: item._id,
        active: 1,
        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
    }
    let rcrdAksi = {
        qty: parseInt(barangMasukTerakhir.total_qty_masuk) + parseInt(rcdAks.qty),
        tahun_bulan: `${thn}-${bln + 1}`,
        tgl_update: `${thn}-${bln + 1}-${tgl}`,
        product: item._id
    }
    let recordAksi = new RecordAksi(rcrdAksi);
    await recordAksi.save();
    await Product.findByIdAndUpdate(item._id, { qty: (parseInt(barangMasukTerakhir.total_qty_masuk) + parseInt(rcdAks.qty)) });
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