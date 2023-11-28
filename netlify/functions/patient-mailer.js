const nodeMailer = require("nodemailer");
const formidable = require('formidable');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Parse the multipart/form-data
    const form = new formidable.IncomingForm();
    const parsed = await new Promise((resolve, reject) => {
        form.parse(event, (err, fields, files) => {
            if (err) reject(err);
            resolve({fields, files});
        });
    });

    const { fields, files } = parsed;

    // Configure the mail transporter
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

    // Mail options including the attachments
    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: process.env.MRR_MAIL,
        subject: `New Patient Form Submission: ${fields.firstName} ${fields.lastName}`,
        html: `<h1>Patient Information</h1>
               <h3>First Name: ${fields.firstName}</h3>
               <h3>Last Name: ${fields.lastName}</h3>
               <h3>Email: ${fields.emailAddress}</h3>
               <h3>Phone: ${fields.phone}</h3>
               <h3>Insurance Provider: ${fields.insurance}</h3>
               <h3>ID Number: ${fields.memberID}</h3>
               <h3>Group Number: ${fields.groupNumber}</h3>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { statusCode: 200, body: 'Message sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { statusCode: 500, body: 'Error sending email' };
    }
};
