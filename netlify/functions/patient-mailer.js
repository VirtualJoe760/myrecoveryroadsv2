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
               <p>First Name: ${fields.firstName}</p>
               <p>Last Name: ${fields.lastName}</p>
               <p>Email: ${fields.emailAddress}</p>
               <p>Phone: ${fields.phone}</p>
               <p>Insurance Provider: ${fields.insurance}</p>
               <p>ID Number: ${fields.memberID}</p>
               <p>Group Number: ${fields.groupNumber}</p>`,
        attachments: [
            { filename: files['front-upload'].name, path: files['front-upload'].path },
            { filename: files['back-upload'].name, path: files['back-upload'].path }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        return { statusCode: 200, body: 'Message sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { statusCode: 500, body: 'Error sending email' };
    }
};
