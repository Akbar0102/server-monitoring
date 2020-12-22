const mongoose = require('mongoose');

const pasienSchema = new mongoose.Schema({
    tanggal: {
        type: Date,
        required: true
    },
    nomor_pasien: {
        type: String,
        required: true
    },
    usia: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Pasien', pasienSchema);