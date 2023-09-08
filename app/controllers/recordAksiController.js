const RecordAksi = require('../models/recordAksiModel');

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

        let record = await RecordAksi.find(criteria).skip(parseInt(skip)).limit(parseInt(limit)).populate('product');
        return res.json({
            data: record,
        })
    } catch (err) {
        next(err);
    }
}

module.exports = {
    index
}