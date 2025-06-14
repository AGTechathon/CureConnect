const ErrorHandler = require("../utils/errorHander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const EmergencyNotification = require("../models/emergencyModel");
const sendEmail = require("../utils/sendEmail");
const validator = require("validator");

// Create emergency notification
exports.createEmergencyNotification = catchAsyncError(async (req, res, next) => {
    const notification = await EmergencyNotification.create({
        patient: req.user._id,
        status: "pending",
        roomId: "emergency"
    });

    // Notify all available doctors through WebSocket
    req.app.get('io').emit('emergencyNotification', {
        notificationId: notification._id,
        patientName: req.user.name,
        roomId: "emergency",
        createdAt: notification.createdAt
    });

    // Send email notifications to all doctors
    try {
        const doctors = await User.find({ 
            role: "doctor",
            contact: { $exists: true }
        });

        const doctorsWithEmail = doctors.filter(doctor => 
            validator.isEmail(doctor.contact)
        );

        if (doctorsWithEmail.length === 0) {
            console.log("⚠️ WARNING: No doctors found with valid email addresses!");
            return res.status(201).json({
                success: true,
                roomId: "emergency",
                message: "Emergency notification sent via WebSocket only - no doctors with valid emails found"
            });
        }

        // Direct video call link for emergency consultation
        const emergencyVideoCallLink = "https://video-call-final-git-main-orthodox-64s-projects.vercel.app/?roomID=emergency";
        const emergencyConsoleLink = `${process.env.FRONTEND_URL || 'https://yourapp.com'}/telemedicine`;

        // Send emails to all doctors with valid email addresses
        const emailPromises = doctorsWithEmail.map(async (doctor, index) => {
            console.log(`📤 Sending email ${index + 1}/${doctorsWithEmail.length} to Dr. ${doctor.name} (${doctor.contact})`);

            const emailOptions = {
                email: doctor.contact,
                subject: "🚨 Emergency Medical Consultation Required - Immediate Attention Needed",
                message: `
                    Dear Dr. ${doctor.name},

                    🚨 EMERGENCY MEDICAL CONSULTATION ALERT 🚨

                    A patient requires immediate medical attention and has requested an emergency consultation.

                    Patient Details:
                    - Name: ${req.user.name}
                    - Contact: ${req.user.contact}
                    - Request Time: ${new Date().toLocaleString()}
                    - Emergency ID: EMG-${notification._id.toString().slice(-6)}

                    🎥 DIRECT VIDEO CALL ACCESS:
                    Click here to join the emergency video consultation immediately:
                    ${emergencyVideoCallLink}

                    URGENT ACTION REQUIRED:
                    1. Click the video call link above to join IMMEDIATELY
                    2. Or log into the Emergency Console: ${emergencyConsoleLink}
                    3. Accept the emergency consultation call
                    4. Provide immediate medical guidance

                    ⏰ Response Target: Less than 2 minutes
                    🎯 Priority: CRITICAL
                    🏥 Room ID: emergency

                    IMPORTANT INSTRUCTIONS:
                    - Use the direct video call link for fastest access
                    - Patient is waiting for immediate medical consultation
                    - This is a time-sensitive emergency situation
                    - All emergency protocols should be followed

                    Emergency Links:
                    📹 Direct Video Call: ${emergencyVideoCallLink}
                    🖥️ Emergency Console: ${emergencyConsoleLink}

                    This is an automated emergency notification. Please respond immediately.

                    Best regards,
                    AgPatil Healthcare Emergency System

                    ---
                    Emergency Hotline: ${process.env.EMERGENCY_HOTLINE || 'Contact Admin'}
                    Technical Support: ${process.env.SUPPORT_EMAIL || 'support@agpatil.com'}
                    Emergency System Status: OPERATIONAL
                `.trim()
            };

            try {
                await sendEmail(emailOptions);
                console.log(`✅ Email successfully sent to Dr. ${doctor.name} (${doctor.contact})`);
                return { success: true, doctor: doctor.name, email: doctor.contact };
            } catch (error) {
                console.error(`❌ Failed to send email to Dr. ${doctor.name} (${doctor.contact}):`, error.message);
                return { success: false, doctor: doctor.name, email: doctor.contact, error: error.message };
            }
        });

        // Execute all email sending promises and wait for results
        const emailResults = await Promise.allSettled(emailPromises);

        // Process results and log detailed information
        let successCount = 0;
        let failureCount = 0;

        emailResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const emailResult = result.value;
                if (emailResult.success) {
                    successCount++;
                } else {
                    failureCount++;
                    console.error(`📧 Email ${index + 1} failed:`, emailResult.error);
                }
            } else {
                failureCount++;
                console.error(`📧 Email ${index + 1} promise rejected:`, result.reason);
            }
        });

        console.log(`📊 Email sending completed: ${successCount} successful, ${failureCount} failed out of ${doctorsWithEmail.length} total`);

        if (successCount === 0) {
            console.error("🚨 CRITICAL: No emails were sent successfully!");
        }

    } catch (emailError) {
        console.error("💥 Critical error in email sending process:", emailError);
        // Don't fail the entire request if email sending fails
        // The WebSocket notification will still work
    }

    res.status(201).json({
        success: true,
        roomId: "emergency",
        message: "Emergency notification sent to all available doctors with video call access"
    });
});

// Get all emergency notifications (for doctors)
exports.getEmergencyNotifications = catchAsyncError(async (req, res, next) => {
    const notifications = await EmergencyNotification.find({ status: "pending" })
        .populate('patient', 'name contact');

    res.status(200).json({
        success: true,
        notifications
    });
});