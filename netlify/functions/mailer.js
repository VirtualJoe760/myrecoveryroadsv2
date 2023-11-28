const nodeMailer = require("nodemailer");
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    console.log('Event Body:', event.body);
    const formData = querystring.parse(event.body); // or JSON.parse(event.body) if the data is in JSON format

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

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: process.env.MRR_MAIL,
        subject: formData.Title, // Make sure this matches your form's field name
        html: `<h1>New Story Submission: ${formData.Title}</h1>
           <h3>First Name: ${formData.firstName}</h3>
           <h3>Last Name: ${formData.lastName}</h3>
           <h3>Email: ${formData.emailAddress}</h3>
           <p>${formData.message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { 
            statusCode: 200, 
            body: 'Message sent successfully',
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return { 
            statusCode: 500, 
            body: 'Error sending story',
        };
    }
};
