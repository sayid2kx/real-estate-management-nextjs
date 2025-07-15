const nodemailer = require('nodemailer')

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

/**
 * Send buy request notification email to seller
 * @param {Object} params - Email parameters
 * @param {string} params.sellerEmail - Seller's email address
 * @param {string} params.buyerEmail - Buyer's email address
 * @param {Object} params.property - Property details
 */
export async function sendBuyRequestEmail({
  sellerEmail,
  buyerEmail,
  property,
}) {
  try {
    // Format price properly
    const formattedPrice =
      typeof property.price === 'number'
        ? property.price.toLocaleString()
        : property.price

    const mailOptions = {
      from: `PrimerPlaces Marketplace <${process.env.GMAIL_USER}>`, // Use your Gmail address
      to: sellerEmail,
      subject: `Property Buy Request: ${property.propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Buy Request</h2>
          <p>You have received a new buy request for your property:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>${property.propertyTitle}</h3>
            <p><strong>Property Type:</strong> ${property.propertyType}</p>
            <p><strong>Price:</strong> ${formattedPrice} BDT</p>
            <p><strong>Location:</strong> ${property.address}</p>
          </div>
          
          <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
          
          <p>Please log in to your account to view and respond to this request.</p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, data: info }
  } catch (error) {
    console.error('Error sending buy request email:', error)
    return { success: false, error }
  }
}

/**
 * Send negotiation request notification email to seller
 * @param {Object} params - Email parameters
 * @param {string} params.sellerEmail - Seller's email address
 * @param {string} params.buyerEmail - Buyer's email address
 * @param {Object} params.property - Property details
 * @param {number} params.offerPrice - Buyer's offer price
 * @param {string} params.message - Buyer's message (optional)
 */
export async function sendNegotiationRequestEmail({
  sellerEmail,
  buyerEmail,
  property,
  offerPrice,
  message,
}) {
  try {
    // Format prices properly
    const formattedListedPrice =
      typeof property.price === 'number'
        ? property.price.toLocaleString()
        : property.price
    const formattedOfferPrice =
      typeof offerPrice === 'number' ? offerPrice.toLocaleString() : offerPrice

    const mailOptions = {
      from: `PrimerPlaces Marketplace <${process.env.GMAIL_USER}>`, // Use your Gmail address
      to: sellerEmail,
      subject: `Property Negotiation Request: ${property.propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Negotiation Request</h2>
          <p>You have received a new negotiation request for your property:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>${property.propertyTitle}</h3>
            <p><strong>Property Type:</strong> ${property.propertyType}</p>
            <p><strong>Listed Price:</strong> ${formattedListedPrice} BDT</p>
            <p><strong>Offer Price:</strong> ${formattedOfferPrice} BDT</p>
            <p><strong>Location:</strong> ${property.address}</p>
          </div>
          
          <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
          
          ${message ? `<p><strong>Message from buyer:</strong> "${message}"</p>` : ''}
          
          <p>Please log in to your account to view and respond to this negotiation request.</p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, data: info }
  } catch (error) {
    console.error('Error sending negotiation request email:', error)
    return { success: false, error }
  }
}

/**
 * Send buy request status update email to buyer
 * @param {Object} params - Email parameters
 * @param {string} params.buyerEmail - Buyer's email address
 * @param {Object} params.property - Property details
 * @param {string} params.status - Status of the request ('accepted' or 'rejected')
 */
export async function sendBuyRequestStatusEmail({
  buyerEmail,
  property,
  status,
}) {
  try {
    const formattedPrice =
      typeof property.price === 'number'
        ? property.price.toLocaleString()
        : property.price

    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    const statusColor = status === 'accepted' ? '#22c55e' : '#ef4444'

    const mailOptions = {
      from: `PrimerPlaces Marketplace <${process.env.GMAIL_USER}>`, // Use your Gmail address
      to: buyerEmail,
      subject: `Update: Your Buy Request for ${property.propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Buy Request Update</h2>
          <p>Your buy request for the following property has been <strong style="color: ${statusColor};">${statusText}</strong>:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>${property.propertyTitle}</h3>
            <p><strong>Property Type:</strong> ${property.propertyType}</p>
            <p><strong>Price:</strong> ${formattedPrice} BDT</p>
            <p><strong>Location:</strong> ${property.address}</p>
          </div>
          
          ${
            status === 'accepted'
              ? '<p>The seller has accepted your buy request. Please check your account for next steps or contact the seller for further details.</p>'
              : '<p>The seller has rejected your buy request. You may explore other properties or contact the seller for more information.</p>'
          }
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, data: info }
  } catch (error) {
    console.error('Error sending buy request status email:', error)
    return { success: false, error }
  }
}

/**
 * Send negotiation request status update email to buyer
 * @param {Object} params - Email parameters
 * @param {string} params.buyerEmail - Buyer's email address
 * @param {Object} params.property - Property details
 * @param {number} params.offerPrice - Buyer's offer price
 * @param {string} params.status - Status of the request ('accepted' or 'rejected')
 */
export async function sendNegotiationRequestStatusEmail({
  buyerEmail,
  property,
  offerPrice,
  status,
}) {
  try {
    const formattedListedPrice =
      typeof property.price === 'number'
        ? property.price.toLocaleString()
        : property.price
    const formattedOfferPrice =
      typeof offerPrice === 'number' ? offerPrice.toLocaleString() : offerPrice

    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    const statusColor = status === 'accepted' ? '#22c55e' : '#ef4444'

    const mailOptions = {
      from: `PrimerPlaces Marketplace <${process.env.GMAIL_USER}>`, // Use your Gmail address
      to: buyerEmail,
      subject: `Update: Your Negotiation Request for ${property.propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Negotiation Request Update</h2>
          <p>Your negotiation request for the following property has been <strong style="color: ${statusColor};">${statusText}</strong>:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>${property.propertyTitle}</h3>
            <p><strong>Property Type:</strong> ${property.propertyType}</p>
            <p><strong>Listed Price:</strong> ${formattedListedPrice} BDT</p>
            <p><strong>Your Offer:</strong> ${formattedOfferPrice} BDT</p>
            <p><strong>Location:</strong> ${property.address}</p>
          </div>
          
          ${
            status === 'accepted'
              ? '<p>The seller has accepted your offer. Please check your account for next steps or contact the seller to proceed.</p>'
              : '<p>The seller has rejected your offer. You may submit a new offer or explore other properties.</p>'
          }
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, data: info }
  } catch (error) {
    console.error('Error sending negotiation request status email:', error)
    return { success: false, error }
  }
}
