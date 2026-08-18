const assessmentEmail = (
  studentName,
  assessmentTitle,
  courseName,
  dueDate,
  portalLink,
) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
      <h3 style="color: #D97706;">📝 New Assessment Available: ${assessmentTitle}</h3>
      <p>Hello ${studentName},</p>
      <p>A new assignment or quiz has been published for your course: <strong>${courseName}</strong>.</p>
      
      <div style="background-color: #FFFBEB; border-left: 4px solid #D97706; padding: 12px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400E;"><strong>Deadline:</strong> ${dueDate}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${portalLink}" style="background-color: #D97706; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Submit Assessment</a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">D Enskill Academy Portal</p>
    </div>
  `
}

module.exports = assessmentEmail
