const Pasien = require('../models/Pasien');
const moment = require('moment');
const converter = require('json-2-csv');
const fs = require('fs');

module.exports = {
    viewDashboard: async (req, res) => {
        try {
            //menghitung rentang usia
            const rentangUsia = await Pasien.aggregate([
                {
                    '$project': {
                    'range': {
                        '$concat': [
                        {
                            '$cond': [
                            {
                                '$lt': [
                                '$usia', 17
                                ]
                            }, '<17', ''
                            ]
                        }, {
                            '$cond': [
                            {
                                '$and': [
                                {
                                    '$gte': [
                                    '$usia', 17
                                    ]
                                }, {
                                    '$lt': [
                                    '$usia', 40
                                    ]
                                }
                                ]
                            }, '17 - 40', ''
                            ]
                        }, {
                            '$cond': [
                            {
                                '$gt': [
                                '$usia', 40
                                ]
                            }, '40>', ''
                            ]
                        }
                        ]
                    }
                    }
                }, {
                    '$group': {
                    '_id': '$range', 
                    'count': {
                        '$sum': 1
                    }
                    }
                }
            ]);

            //menghitung status pasien
            const statusPasien = await Pasien.aggregate([
                {
                  '$group': {
                    '_id': '$status', 
                    'count': {
                      '$sum': 1
                    }
                  }
                }
            ]);
            
            //mengambil data jumlah pasien per hari
            const harianPasien = await Pasien.aggregate([
                {
                    '$group': {
                      '_id': '$tanggal', 
                      'count': {
                        '$sum': 1
                      }
                    }
                  }, {
                    '$sort': {
                      '_id': 1
                    }
                  }
            ]);

            res.render('admin/dashboard/view_dashboard', {
                rentangUsia: rentangUsia,
                statusPasien: statusPasien,
                harianPasien: harianPasien
            });
        } catch (error) {
            res.render('admin/dashboard/view_dashboard');
        }
    },
    viewForm: async (req, res) => {
        try {
            const pasien = await Pasien.find();
    
            res.render('admin/form/view_form', {
                pasien,
                moment
            });
        } catch (error) {
            res.render('admin/form/view_form');
        }
    },
    addData: async (req, res) => {
        try {
            const {tanggal, nomor_pasien, usia, status} = req.body;
    
            await Pasien.create({
                tanggal,
                nomor_pasien,
                usia,
                status
            });

            res.redirect('/admin/form');
        } catch (error) {
            res.redirect('/admin/form');
        }
    },
    editData: async (req, res) => {
        try {
            const {id, tanggal, nomor_pasien, usia, status} = req.body;
            const pasien = await Pasien.findOne({_id: id});
            pasien.tanggal = tanggal;
            pasien.nomor_pasien = nomor_pasien;
            pasien.usia = usia;
            pasien.status = status;
            await pasien.save();
    
            res.redirect('/admin/form');  
        } catch (error) {
            res.redirect('/admin/form');
        }
    },
    deleteData: async (req, res) => {
        try {
            const {id} = req.params;
            const pasien = await Pasien.findOne({_id: id});
            await pasien.remove();

            res.redirect('/admin/form');
        } catch (error) {
            res.redirect('/admin/form');
        }
    },
    exportData: async (req, res) => {
        try {
            const print = await Pasien.aggregate([
                {
                  '$group': {
                    '_id': {
                      'status': '$status', 
                      'tanggal': '$tanggal'
                    }, 
                    'count': {
                      '$sum': 1
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$_id.tanggal', 
                    'data': {
                      '$addToSet': {
                        'count': '$count', 
                        'status': '$_id.status'
                      }
                    }
                  }
                }, {
                  '$unwind': {
                    'path': '$data'
                  }
                }, {
                  '$sort': {
                    '_id': 1
                  }
                },  {
                    '$project': {
                      '_id': 0, 
                      'tanggal': {
                        '$dateToString': {
                          'format': '%d-%m-%Y', 
                          'date': '$_id'
                        }
                      }, 
                      'count': '$data.count', 
                      'status': '$data.status'
                    }
                }
              ]);
 
            converter.json2csv(print, (err, csv) => {
                if (err) {
                    throw err;
                }
            
                fs.writeFileSync('data.csv', csv);
            });

            res.redirect('/admin/form');

        } catch (error) {
            res.redirect('/admin/form');
        }
    }
}