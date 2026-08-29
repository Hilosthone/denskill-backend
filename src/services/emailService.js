// // src/services/emailService.js
// const { Resend } = require('resend')
// require('dotenv').config()

// const senderEmail =
//   process.env.EMAIL_FROM || 'D Enskill Academy <onboarding@denskill.com>'

// const scholarshipApprovalEmail = require('../templates/scholarshipApprovalEmail')
// const classAnnouncementEmail = require('../templates/classAnnouncementEmail')
// const assessmentEmail = require('../templates/assessmentEmail')

// // Helper to get initialized Resend client safely at runtime
// const getResendClient = () => {
//   const apiKey = process.env.RESEND_API_KEY
//   if (!apiKey) {
//     throw new Error(
//       'Missing RESEND_API_KEY in environment variables. Please check your .env file.',
//     )
//   }
//   return new Resend(apiKey)
// }

// /**
//  * Send Scholarship Approval Email
//  */
// exports.sendApprovalEmail = async (toEmail, firstName, paymentLink) => {
//   try {
//     const resend = getResendClient()
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
//  * Send Class Announcement Email
//  */
// exports.sendAnnouncementEmail = async (
//   toEmails,
//   title,
//   message,
//   meetingLink,
// ) => {
//   try {
//     const resend = getResendClient()
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
//     const resend = getResendClient()
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

// /**
//  * Send Custom Admin Direct Email (Anti-Spam Layout)
//  */
// exports.sendCustomAdminEmail = async (toEmails, subject, messageHtml) => {
//   try {
//     const resend = getResendClient()

//     let recipientList = toEmails
//     if (typeof toEmails === 'string') {
//       recipientList = toEmails.split(',').map((e) => e.trim()).filter(Boolean)
//     }

//     const { data, error } = await resend.emails.send({
//       from: senderEmail,
//       to: recipientList,
//       subject: subject || 'Message from D Enskill Academy Administration',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
//           <h2 style="color: #7c3aed; margin-top: 0;">D Enskill Academy Update</h2>
//           <div style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">
//             ${messageHtml.replace(/\n/g, '<br>')}
//           </div>
//           <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
//           <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
//             Sent by D Enskill Academy Administration.<br>
//             You are receiving this message as a registered member/student on our platform.
//           </p>
//         </div>
//       `,
//     })

//     if (error) {
//       console.error('❌ Resend API Error:', error)
//       return { success: false, error }
//     }

//     console.log('✅ Custom direct email dispatched successfully:', data)
//     return { success: true, data }
//   } catch (error) {
//     console.error('❌ Error sending custom email:', error.message)
//     return { success: false, error: error.message }
//   }
// }

// src/services/emailService.js
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
 * Send Class Announcement Email
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

/**
 * Send Custom Admin Direct Email (Full Feature Support: HTML, Links, & Attachments)
 */
exports.sendCustomAdminEmail = async (payload) => {
  try {
    const resend = getResendClient()

    let recipientList = payload.to || payload.emails
    if (typeof recipientList === 'string') {
      recipientList = recipientList.split(',').map((e) => e.trim()).filter(Boolean)
    }

    // Determine the final HTML body: 
    // If rich HTML is provided, wrap it or use it. Otherwise, fallback to text/message replaced with <br>.
    const rawContent = payload.html || payload.message || ''
    const formattedHtml = payload.html 
      ? payload.html 
      : `<div style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">${rawContent.replace(/\n/g, '<br>')}</div>`

    const emailPayload = {
      from: senderEmail,
      to: recipientList,
      subject: payload.subject || 'Message from D Enskill Academy Administration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #7c3aed; margin-top: 0;">D Enskill Academy Update</h2>
          ${formattedHtml}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            Sent by D Enskill Academy Administration.<br>
            You are receiving this message as a registered member/student on our platform.
          </p>
        </div>
      `,
      attachments: payload.attachments || [],
      cc: payload.cc || undefined,
      bcc: payload.bcc || undefined,
    }

    const { data, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('❌ Resend API Error:', error)
      return { success: false, error }
    }

    console.log('✅ Custom direct email dispatched successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error sending custom email:', error.message)
    return { success: false, error: error.message }
  }
}