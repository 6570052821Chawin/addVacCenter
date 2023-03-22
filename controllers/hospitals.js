const Hospital = require('../models/Hospital')
const vacCenter = require('../models/VacCenter')


//@desc      Get vaccine centers
//@route    GET api/v1/hospitals/vacCenters/
//@access   Public
exports.getVacCenters = (req, res, next) => {
    vacCenter.getAll((err, data) => {
        if (err)
        res.status(500).send({
            message:
                err.message || "Some error occured while retriving Vaccine centers."
        });
        else res.send(data);
    });
};

// Get hospitals
exports.getHospitals = async (req, res, next) => {
    let query;

    //Copy req.query แตก Query ที่เป็น String ธรรมดาเป็น Array ของ Key Value
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeField = ['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeField.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create Query String
    let queryStr = JSON.stringify(reqQuery);

    //Create Operation ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //finding resource
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

    //Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hospital.countDocuments();
    
    //Pagination result
    const pagintaion = {};

    if(endIndex < total) {
        pagintaion.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagintaion.prev = {
            page: page - 1,
            limit
        }
    }

    try{
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);
        //Execute query
        const hospitals =  await query;
        console.log(req.query);

        //Pagination result
        const pagintaion = {};

        if(endIndex < total) {
            pagintaion.next = {
                page: page + 1,
                limit
            }
        }
        if(startIndex > 0) {
            pagintaion.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({success: true, count: hospitals.length, pagintaion, data:hospitals});
    } catch(err){
        res.status(400).json({success: false});
    }
};

// Get One Hospital
exports.getHospital = async (req, res, next) => {
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: hospital});
    } catch(err){
        res.status(400).json({success:false});
    }
};

//Create
exports.createHospital = async (req, res, next) => {
    console.log(req.body);
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
        success: true,
        data: hospital
    });
};


// Update
exports.updateHospital = async (req, res, next) => {
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!hospital){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success:true, data: hospital});
    } catch(err){
        res.status(400).json({success: false});
    }
};

// Delete
exports.deleteHospital = async (req, res, next) => {
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success: false});
        }

        hospital.remove();
        res.status(200).json({success: true, data: {}});
    } catch(err){
        res.status(400).json({success: false});
    }
};