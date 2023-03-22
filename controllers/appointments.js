const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Private

exports.getAppointments = async (req, res, next) => {
    let query;
    //General users can see only their appointments
    if(req.user.role !== 'admin') {
        query = Appointment.find({user:req.user.id}).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    } else { // if You are and admin you can see it all
        query = Appointment.find().populate({
            path: 'hospital',
            select: 'name province tel'
        });
    }
    try {
        const appointments = await query;

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    }
    catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Can't find Appointment"})
    }
}

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Private

exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name description tel'
        });

        if(!appointment) {
            return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot find Appoinment'});
    }
};


//@desc     Add appointment
//@route    POST /api/v1/hospitals/:hospitalId/appointments/
//@access   Private
exports.addAppointment = async (req, res, next) => {
    try {
        req.body.hospital = req.params.hospitalId;

        const hospital = await Hospital.findById(req.params.hospitalId);

        if (!hospital) {
            return res.status(404).json({success: false, message: `No hospital with the id of ${req.params.hospitalId}`});
        }
        console.log(req.body);

        //Add user Id to req.body
        req.body.user = req.user.id;
        //Check for existed appointment
        const existedAppointments = await Appointment.find({user: req.user.id});
        //If the user is not an admin, They can only create 3 appointment.
        if(existedAppointments.lenght >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `The user with IdD ${req.user.id} has already made 3 appointments`})
        }

        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot create Appointment"})
    }
};

//@desc     Update appointment
//@route    PUT /api/v1/hospitals/:hospitalId/appointments/
//@access   Private
exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`})
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this appointment`})
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id , req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot update appointment"})
    }
};


//@desc     Delete appointment
//@route    DELETE /api/v1/hospitals/:hospitalId/appointments/
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`})
        }

        //Make sure user is the owner of the appointment
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this appointment`})
        }

        await appointment.remove()
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot delete appointment'});
    }
};

