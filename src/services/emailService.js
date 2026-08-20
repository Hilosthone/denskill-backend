// const { Resend } = require('resend')
// require('dotenv').config()

// const resend = new Resend(process.env.RESEND_API_KEY)
// const senderEmail = 'D Enskill Academy <support@denskill.com>' // Ensure your domain is verified in Resend

// const scholarshipApprovalEmail = require('../templates/scholarshipApprovalEmail')
// const classAnnouncementEmail = require('../templates/classAnnouncementEmail')
// const assessmentEmail = require('../templates/assessmentEmail')

// /**
//  * Send Scholarship Approval Email
//  */
// exports.sendApprovalEmail = async (toEmail, firstName, paymentLink) => {
//   try {
//     await resend.emails.send({
//       from: senderEmail,
//       to: [toEmail],
//       subject: '🎉 Congratulations! Your Scholarship Has Been Approved',
//       html: scholarshipApprovalEmail(firstName, paymentLink),
//     })
//     console.log(`✅ Approval email sent to ${toEmail}`)
//   } catch (error) {
//     console.error('❌ Error sending approval email:', error.message)
//   }
// }

// /**
//  * Send Class Announcement Email (To Students, Tutors, or Admins)
//  */
// exports.sendAnnouncementEmail = async (
//   toEmails,
//   title,
//   message,
//   meetingLink,
// ) => {
//   try {
//     // toEmails can be a single string or an array of emails
//     await resend.emails.send({
//       from: senderEmail,
//       to: Array.isArray(toEmails) ? toEmails : [toEmails],
//       subject: `📢 Announcement: ${title}`,
//       html: classAnnouncementEmail(
//         'Student/Colleague',
//         title,
//         message,
//         meetingLink,
//       ),
//     })
//     console.log('✅ Announcement email dispatched successfully')
//   } catch (error) {
//     console.error('❌ Error sending announcement email:', error.message)
//   }
// }

// /**
//  * Send Assessment / Quiz Notification
//  */
// exports.sendAssessmentNotification = async (
//   toEmails,
//   assessmentTitle,
//   courseName,
//   dueDate,
//   portalLink,
// ) => {
//   try {
//     await resend.emails.send({
//       from: senderEmail,
//       to: Array.isArray(toEmails) ? toEmails : [toEmails],
//       subject: `📝 New Assessment: ${assessmentTitle}`,
//       html: assessmentEmail(
//         'Student',
//         assessmentTitle,
//         courseName,
//         dueDate,
//         portalLink,
//       ),
//     })
//     console.log('✅ Assessment notification email sent')
//   } catch (error) {
//     console.error('❌ Error sending assessment email:', error.message)
//   }
// }

//src/services/emailService.js
const { Resend } = require('resend')
require('dotenv').config()

const senderEmail =
  process.env.EMAIL_FROM || 'D Enskill Academy <onboarding@denskill.com>'

const scholarshipApprovalEmail = require('../templates/scholarshipApprovalEmail')
const classAnnouncementEmail = require('../templates/classAnnouncementEmail')
const assessmentEmail = require('../templates/assessmentEmail')

// Helper to get initialized Resend client safely at runtime
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing RESEND_API_KEY in environment variables. Please check your .env file.',
    )
  }
  return new Resend(apiKey)
}

/**
 * Send Scholarship Approval Email
 */
exports.sendApprovalEmail = async (toEmail, firstName, paymentLink) => {
  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: senderEmail,
      to: [toEmail],
      subject: '🎉 Congratulations! Your Scholarship Has Been Approved',
      html: scholarshipApprovalEmail(firstName, paymentLink),
    })
    console.log(`✅ Approval email sent to ${toEmail}`)
  } catch (error) {
    console.error('❌ Error sending approval email:', error.message)
  }
}

/**
 * Send Class Announcement Email (To Students, Tutors, or Admins)
 */
exports.sendAnnouncementEmail = async (
  toEmails,
  title,
  message,
  meetingLink,
) => {
  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: senderEmail,
      to: Array.isArray(toEmails) ? toEmails : [toEmails],
      subject: `📢 Announcement: ${title}`,
      html: classAnnouncementEmail(
        'Student/Colleague',
        title,
        message,
        meetingLink,
      ),
    })
    console.log('✅ Announcement email dispatched successfully')
  } catch (error) {
    console.error('❌ Error sending announcement email:', error.message)
  }
}

/**
 * Send Assessment / Quiz Notification
 */
exports.sendAssessmentNotification = async (
  toEmails,
  assessmentTitle,
  courseName,
  dueDate,
  portalLink,
) => {
  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: senderEmail,
      to: Array.isArray(toEmails) ? toEmails : [toEmails],
      subject: `📝 New Assessment: ${assessmentTitle}`,
      html: assessmentEmail(
        'Student',
        assessmentTitle,
        courseName,
        dueDate,
        portalLink,
      ),
    })
    console.log('✅ Assessment notification email sent')
  } catch (error) {
    console.error('❌ Error sending assessment email:', error.message)
  }
}