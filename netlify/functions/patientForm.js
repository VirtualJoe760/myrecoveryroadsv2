const axios = require('axios');
const querystring = require('querystring');
const nodeMailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!event.body) {
        console.error('No event body in the request');
        return { statusCode: 400, body: 'No event body in the request' };
    }

    const formData = querystring.parse(event.body);

    // Configure Mailchimp API
    const mailchimpAPI = `https://us21.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`;
    const mailchimpHeaders = {
        'Authorization': `Basic ${Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
    };

    // Configure NodeMailer
    const transporter = nodeMailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: false,
        port: 587,
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    try {
        // Mailchimp API request to add contact
        const mailchimpData = {
            email_address: formData.emailAddress,
            status: 'subscribed',
            merge_fields: {
                FNAME: formData.firstName,
                LNAME: formData.lastName,
                PHONE: formData.phone,
                INSURANCE: formData.insurance,
                MEMBERID: formData.memberID,
                GROUPNUMBER: formData.groupNumber
            },
            tags: formData.tags ? [formData.tags] : []
        };

        await axios.post(mailchimpAPI, mailchimpData, { headers: mailchimpHeaders });

        // Trigger customer journey
        const journeyId = formData.journey;
        const journeyAPI = `https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/${journeyId}/steps/25234/actions/trigger`;
        await axios.post(journeyAPI, { email_address: formData.emailAddress }, { headers: mailchimpHeaders });

        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: process.env.MRR_MAIL,
            subject: 'New Patient Form Submission',
            html: `<h1>New Patient Form Submission</h1><hr />
                     <p>First Name: ${formData.firstName}</p>
                     <p>Last Name: ${formData.lastName}</p>
                     <p>Email: ${formData.emailAddress}</p>
                     <p>Phone: ${formData.phone}</p>
                     <p>Insurance: ${formData.insurance}</p>
                     <p>Member ID: ${formData.memberID}</p>
                     <p>Group Number: ${formData.groupNumber}</p>`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        return { statusCode: 200, body: 'Contact added to Mailchimp, journey triggered, and email sent' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: `Error processing the request: ${error.message}` };
    }
};