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

                //* pengecekan untuk pertama kali menambahkan qty berdasarkan input sebelumnya, pendataan bulan ke 1 untuk masuk bulan ke bulan ke 1
                if (jumlah.length === 1) {
                    let data = await BarangMasuk.findOne({ product: item._id, qty_masuk: { $ne: 0 }, active: 1 }).limit(1);
                    let barangMasukTerakhir = {
                        qty_masuk: data.qty_masuk
                    }
                    let rcdAks = await RecordAksi.findOne({ product: item._id }).limit(1);
                    // console.log(rcdAks);
                    //? Memasukan Data Pada bulan ke1
                    // await _masukanDataQtySama(item, barangMasukTerakhir, rcdAks);
                    let date = new Date();
                    let tgl = date.getDate();
                    let bln = date.getMonth();
                    let thn = date.getFullYear();
                    let dataa = {
                        qty_sebelum: item.qty,
                        qty_masuk: parseInt(barangMasukTerakhir.qty_masuk),
                        qty_masuk_sebelumnya: data.qty_masuk_sebelumnya,
                        tahun_bulan: `${thn}-${bln + 1}`,
                        total_qty_masuk: parseInt(rcdAks.qty),
                        product: item._id,
                        active: 1,
                        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
                    }
                    let rcrdAksi = {
                        qty: parseInt(rcdAks.qty),
                        tahun_bulan: `${thn}-${bln + 1}`,
                        tgl_update: `${thn}-${bln + 1}-${tgl}`,
                        product: item._id
                    }
                    let recordAksi = new RecordAksi(rcrdAksi);
                    await recordAksi.save();
                    await Product.findByIdAndUpdate(item._id, { qty: parseInt(rcdAks.qty) });
                    let barang = new BarangMasuk(dataa);
                    await barang.save();
                    console.log('data bulan pertama telah di tambahkan');
                }
                else if (jumlah.length === 2) {
                    console.log('Masuk pendataan Bulan Ke 2');
                    let data = await BarangMasuk.findOne({ product: item._id, qty_masuk: { $ne: 0 }, active: 1 }).sort({ createdAt: -1 }).limit(1);

                    // //* pengecekan untuk pendataan pada bulan ke 2
                    let barangMasukTerakhir = {
                        qty_masuk: data.qty_masuk,
                        qty_masuk_sebelumnya: data.qty_masuk_sebelumnya,
                        total_qty_masuk: data.total_qty_masuk
                    }

                    let rcdAks = await RecordAksi.findOne({ product: item._id }).sort({ createdAt: -1 }).limit(1);
                    // //? Memasukan Data Pada bulan kedua
                    await _masukanDataQtySama(item, barangMasukTerakhir, rcdAks);

                    console.log('data bulan kedua telah di tambahkan');
                } else if (jumlah.length > 2) {
                    let jmlhDataBarang = jumlah.length % 3;
                    let barangMasukTerakhir = await BarangMasuk.find({ product: item._id, active: 1 }).sort({ _id: -1 }).limit(2);
                    if (jmlhDataBarang === 0) {
                        // console.log(barangMasukTerakhir);
                        //* masuk perubahan qty pada bulan kelipatan 3, contoh : 3,6,9....
                        //? Memasukan Data Pada bulan kelipatan 3
                        // await _masukanDataQtySama(item, barangMasukTerakhir);
                        await _masukanDataKeBulanGanjil(item, barangMasukTerakhir);

                        console.log('data qty masuk pada bulan Ganjil, jmlh qty masuk di hitung kembali');
                    }
                    else if (jmlhDataBarang === 1) {

                        // //* masuk perubahan qty pada bulan ganjil, contoh : 5,7,9....
                        // //? Memasukan Data Pada bulan Ganjil
                        // await _masukanDataKeBulanGanjil(item, barangMasukTerakhir);

                        console.log('data qty masuk pada bulan ganjil, qty yg masuk sama');
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
    let blnPertama;
    if (bln === 0) {
        blnPertama = 10;
    } else if (bln === 1) {
        blnPertama = 11;
    } else if (bln === 2) {
        blnPertama = 12;
    } else {
        blnPertama = bln - 2;
    }
    let blnKedua;
    if (bln === 0) {
        blnKedua = 12;
    } else {
        blnKedua = bln;
    }
    // let kondisiBln = bln - 2 <= 0 || bln === 0 ? 12 : bln - 2;
    //* jika bln = 0 berarti niat mengambil data bulan 10(oktober), jika bln = 1 berarti niat mengambil data bulan ke 11(november), jika bulan = 2 berarti niat mengambil data bulan 1(januari), sebelum di tentukan bulan keberapa yg aan di ambil varibel bln harus di kurang 2 terlebih dahulu, dan hasilnya baru di tentukan bulan yg ingin di ambil
    // console.log(`${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-1`);
    console.log(bln);
    console.log(thn);
    console.log(blnPertama);
    console.log(blnKedua);
    let barangKeluar;
    barangKeluar = await BarangKeluar.find(
        {
            $and: [
                {
                    product: item._id,
                    active: 1,
                    tgl_keluar: {
                        $gte: `${blnPertama === 10 || blnPertama === 11 || blnPertama === 12 ? thn - 1 : thn}-${blnPertama}-1`,
                        $lte: `${blnKedua === 12 ? thn - 1 : thn}-${blnKedua}-31`
                    },
                }
            ]
        }
    );
    // console.log(barangKeluar);
    // if (kondisiBln === 12) {
    //     let barang = [];
    //     let data1 = await BarangKeluar.find(
    //         {
    //             $and: [
    //                 {
    //                     product: item._id,
    //                     tgl_keluar: {
    //                         $gte: `${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-1`,
    //                         $lte: `${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-31`
    //                     },
    //                 }
    //             ]
    //         }
    //     );
    //     let data2 = await BarangKeluar.find(
    //         {
    //             $and: [
    //                 {
    //                     product: item._id,
    //                     tgl_keluar: {
    //                         $gte: `${thn}-${bln}-1`,
    //                         $lte: `${thn}-${bln}-31`
    //                     },
    //                 }
    //             ]
    //         }
    //     );
    //     data1.map((tem, i) => {
    //         barang.push(tem);
    //     });
    //     data2.map((tem, i) => {
    //         barang.push(tem);
    //     });
    //     barangKeluar = barang;
    // } else {
    //     barangKeluar = await BarangKeluar.find(
    //         {
    //             $and: [
    //                 {
    //                     product: item._id,
    //                     tgl_keluar: {
    //                         $gte: `${kondisiBln === 12 ? thn - 1 : thn}-${kondisiBln}-1`,
    //                         $lte: `${thn}-${bln}-31`
    //                     },
    //                 }
    //             ]
    //         }
    //     );
    // }



    // console.log(barangKeluar);
    barangKeluar.map((tem, j) => {
        jual = jual + tem.total_qty_keluar
    });
    // console.log(jual);
    // console.log(barangMasukTerakhir);
    let qty = _prosesPerhitungan((parseInt(barangMasukTerakhir[0].qty_masuk) + parseInt(barangMasukTerakhir[0].qty_masuk_sebelumnya)), (parseInt(barangMasukTerakhir[1].qty_masuk) + parseInt(barangMasukTerakhir[1].qty_masuk_sebelumnya)), jual);
    date = new Date();
    let tgl = date.getDate();
    bln = date.getMonth();
    thn = date.getFullYear();
    // let dataa = {
    //     qty_sebelum: item.qty,
    //     qty_masuk: parseInt(barangMasukTerakhir.qty_masuk),
    //     qty_masuk_sebelumnya: 0,
    //     tahun_bulan: `${thn}-${bln + 1}`,
    //     total_qty_masuk: parseInt(rcdAks.qty),
    //     product: item._id,
    //     active: 1,
    //     tgl_masuk: `${thn}-${bln + 1}-${tgl}`
    // }
    let data = {
        qty_sebelum: item.qty,
        qty_masuk: qty,
        qty_masuk_sebelumnya: 0,
        tahun_bulan: `${thn}-${bln + 1}`,
        total_qty_masuk: qty + item.qty,
        product: item._id,
        active: 1,
        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
    }
    let rcrdAksi = {
        qty: qty + item.qty,
        tahun_bulan: `${thn}-${bln + 1}`,
        tgl_update: `${thn}-${bln + 1}-${tgl}`,
        product: item._id
    }
    let recordAksi = new RecordAksi(rcrdAksi);
    await recordAksi.save();
    await Product.findByIdAndUpdate(item._id, { qty: qty + item.qty });
    let barang = new BarangMasuk(data);
    await barang.save();
}

//!==============================
const _masukanDataQtySama = async (item, barangMasukTerakhir, rcdAks) => {
    // console.log(item);
    // console.log(barangMasukTerakhir);
    // console.log(rcdAks);
    let date = new Date();
    let tgl = date.getDate();
    let bln = date.getMonth();
    let thn = date.getFullYear();
    let data = {
        qty_sebelum: item.qty,
        qty_masuk: parseInt(barangMasukTerakhir.qty_masuk) + parseInt(barangMasukTerakhir.qty_masuk_sebelumnya),
        qty_masuk_sebelumnya: 0,
        tahun_bulan: `${thn}-${bln + 1}`,
        total_qty_masuk: parseInt(barangMasukTerakhir.qty_masuk) + parseInt(barangMasukTerakhir.qty_masuk_sebelumnya) + parseInt(rcdAks.qty),
        product: item._id,
        active: 1,
        tgl_masuk: `${thn}-${bln + 1}-${tgl}`
    }
    let rcrdAksi = {
        qty: parseInt(barangMasukTerakhir.qty_masuk) + parseInt(barangMasukTerakhir.qty_masuk_sebelumnya) + parseInt(rcdAks.qty),
        tahun_bulan: `${thn}-${bln + 1}`,
        tgl_update: `${thn}-${bln + 1}-${tgl}`,
        product: item._id
    }
    let recordAksi = new RecordAksi(rcrdAksi);
    await recordAksi.save();
    await Product.findByIdAndUpdate(item._id, { qty: (parseInt(barangMasukTerakhir.qty_masuk) + parseInt(barangMasukTerakhir.qty_masuk_sebelumnya) + parseInt(rcdAks.qty)) });
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