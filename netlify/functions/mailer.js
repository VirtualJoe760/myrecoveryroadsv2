const nodeMailer = require("nodemailer");

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const formData = JSON.parse(event.body);

    const transporter = nodeMailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: false,
        port: 587,
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASS,
        }
        tls: {
            ciphers: 'SSLv3'
        }
    });

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: process.env.MRR_MAIL,
        subject: formData.Title,
        text: `First Name: ${formData.firstName} \n Last Name: ${formData.lastName} \n Email: ${formData.emailAddress} \n Story: ${formData.message}`
    };

    try{
        await transporter.sendMail(mailOptions);
        return { 
            statusCode: 200, 
            body: 'Message sent successfully',
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return { 
            statusCode: 500, 
            body: `Error sending story`,
        };
    }
};