const { Appointment, Patient, Doctor, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Book new appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, appointment_time, reason } = req.body;
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        // Check if doctor exists and is approved
        const doctor = await Doctor.findByPk(doctor_id);
        if (!doctor || !doctor.is_approved) {
            return res.status(404).json({ success: false, message: 'Doctor not found or not approved' });
        }

        // Check for existing appointment at same time
        const existing = await Appointment.findOne({
            where: {
                doctor_id,
                appointment_date,
                appointment_time,
                status: { [Op.notIn]: ['cancelled', 'rejected'] }
            }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Time slot already booked' });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patient_id: patient.id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status: 'pending'
        });

        // Notify doctor
        const doctorUser = await User.findOne({ where: { id: doctor.user_id } });
        await Notification.create({
            user_id: doctorUser.id,
            type: 'appointment_request',
            title: 'New Appointment Request',
            message: `New appointment request for ${appointment_date}`
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get patient appointments
exports.getPatientAppointments = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        const appointments = await Appointment.findAll({
            where: { patient_id: patient.id },
            include: [
                { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }
            ],
            order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
        });

        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { appointment_date, appointment_time } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify ownership - patient or doctor of this appointment
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if ((!patient || appointment.patient_id !== patient.id) && (!doctor || appointment.doctor_id !== doctor.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to reschedule this appointment' });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Cannot reschedule completed appointment' });
        }

        await appointment.update({
            appointment_date,
            appointment_time,
            status: 'pending'
        });

        res.json({ success: true, message: 'Appointment rescheduled', appointment });
    } catch (error) {
        console.error('Reschedule appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellation_reason } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify ownership - patient or doctor of this appointment
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if ((!patient || appointment.patient_id !== patient.id) && (!doctor || appointment.doctor_id !== doctor.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
        }

        await appointment.update({
            status: 'cancelled',
            cancelled_by: req.user.id,
            cancellation_reason
        });

        res.json({ success: true, message: 'Appointment cancelled' });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get available time slots for a doctor
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Get existing appointments for the date
        const bookedSlots = await Appointment.findAll({
            where: {
                doctor_id: doctorId,
                appointment_date: date,
                status: { [Op.notIn]: ['cancelled', 'rejected'] }
            },
            attributes: ['appointment_time']
        });

        const bookedTimes = bookedSlots.map(a => a.appointment_time);

        // Generate all possible slots (9 AM to 5 PM, 30-minute intervals)
        const allSlots = [];
        for (let hour = 9; hour < 17; hour++) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:00:00`);
            allSlots.push(`${hour.toString().padStart(2, '0')}:30:00`);
        }

        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        res.json({ success: true, availableSlots });
    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Doctor: Get appointment calendar
exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const appointments = await Appointment.findAll({
            where: { doctor_id: doctor.id },
            include: [
                { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }
            ],
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Doctor: Get today's queue
exports.getTodaysQueue = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const today = new Date().toISOString().split('T')[0];

        const queue = await Appointment.findAll({
            where: {
                doctor_id: doctor.id,
                appointment_date: today,
                status: { [Op.in]: ['confirmed', 'in_progress'] }
            },
            include: [{ model: Patient, as: 'patient' }],
            order: [['queue_number', 'ASC']]
        });

        res.json({ success: true, queue });
    } catch (error) {
        console.error('Get queue error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Doctor: Accept appointment
exports.acceptAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify the requesting doctor owns this appointment
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || appointment.doctor_id !== doctor.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to accept this appointment' });
        }

        // Assign queue number
        const maxQueue = await Appointment.max('queue_number', {
            where: {
                doctor_id: appointment.doctor_id,
                appointment_date: appointment.appointment_date,
                status: 'confirmed'
            }
        });

        await appointment.update({
            status: 'confirmed',
            queue_number: (maxQueue || 0) + 1
        });

        // Notify patient
        const patient = await Patient.findByPk(appointment.patient_id);
        await Notification.create({
            user_id: patient.user_id,
            type: 'appointment_confirmed',
            title: 'Appointment Confirmed',
            message: `Your appointment has been confirmed. Queue number: ${appointment.queue_number}`
        });

        res.json({ success: true, message: 'Appointment accepted', appointment });
    } catch (error) {
        console.error('Accept appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Doctor: Reject appointment
exports.rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify the requesting doctor owns this appointment
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || appointment.doctor_id !== doctor.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to reject this appointment' });
        }

        await appointment.update({
            status: 'rejected',
            cancellation_reason: reason
        });

        res.json({ success: true, message: 'Appointment rejected' });
    } catch (error) {
        console.error('Reject appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
