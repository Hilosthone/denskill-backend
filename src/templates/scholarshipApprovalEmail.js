//src/templates/scholarshipApprovalEmail.js
// Scholarship Approval Email Template
const scholarshipApprovalEmail = (firstName, paymentLink) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #4F46E5; text-align: center;">🎉 Congratulations, ${firstName}!</h2>
      <p>We are thrilled to inform you that your application for the <strong>D Enskill Academy Scholarship Program</strong> has been approved by our review board.</p>
      <p>You have been selected for a partial scholarship covering a major percentage of your training. To secure your cohort slot and finalize your admission, please proceed to pay your nominal student contribution.</p>
      
      <!-- Optional Urgency Note -->
      <p style="background-color: #f8fafc; border-left: 4px solid #4F46E5; padding: 10px 15px; font-size: 14px; color: #475569;">
        <strong>Important:</strong> This scholarship offer and your payment link will expire in <strong>7 days</strong>. Please complete your contribution promptly to lock in your spot.
      </p>

      <div style="text-align: center; margin: 35px 0;">
        <a href="${paymentLink}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Pay Contribution & Setup Account</a>
      </div>
      
      <p style="font-size: 14px; color: #555;">If you have any questions or experience payment issues, simply reply directly to this email.</p>
      <p style="margin-top: 30px;">Welcome to the future of tech!</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">D Enskill Academy Team</p>
    </div>
  `
}

module.exports = scholarshipApprovalEmail
