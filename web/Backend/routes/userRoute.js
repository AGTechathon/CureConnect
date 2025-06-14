const express = require('express');
const { registerUser, loginUser, getUserDetails, logout, getAllDoctors, addMedicalHistory, getMedicalHistory } = require('../controller/userController');
const { createEmergencyNotification, getEmergencyNotifications } = require('../controller/emergencyController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router()


router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logout)


router.route('/doctors').get(getAllDoctors)
router.route('/me').get(isAuthenticatedUser, getUserDetails)

router.route("/medical-history")
    .post(isAuthenticatedUser, addMedicalHistory)

router.route("/medical-history/:userId")
    .get(isAuthenticatedUser, getMedicalHistory)

router.route("/emergency/notify")
    .post(isAuthenticatedUser, createEmergencyNotification);

router.route("/emergency/notifications")
    .get(isAuthenticatedUser, authorizeRoles("doctor"), getEmergencyNotifications);


module.exports = router