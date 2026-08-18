const classAnnouncementEmail = (studentName, title, message, meetingLink) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
      <h3 style="color: #0D9488;">📢 Announcement: ${title}</h3>
      <p>Hello ${studentName},</p>
      <p style="line-height: 1.6;">${message}</p>
      
      ${
        meetingLink
          ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingLink}" style="background-color: #0D9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Live Session</a>
        </div>
      `
          : ''
      }
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">D Enskill Academy Learning System</p>
    </div>
  `
}

module.exports = classAnnouncementEmail
