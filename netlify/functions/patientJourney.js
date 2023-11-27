const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parsing form data
        const formData = querystring.parse(event.body);

        // Extracting journey ID from form data
        const journeyId = [formData.journey];
        const emailAddress = formData.emailAddress;

        // Log Journey
        console.log('Extracted Journey',journey);
        console.log('Extracted email',emailAddress);

        // Define Mailchimp API configuration
        const mailchimpConfig = {
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        };

        

        // Trigger the customer journey
        const journeyUrl = `https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/${journeyId}/contacts`;
        const response = await axios.post(journeyUrl, { email_address: emailAddress }, mailchimpConfig);
        
        return { statusCode: 200, body: JSON.stringify(response.data) };
    } catch (error) {
        console.error('Error:', error);
        
        return { statusCode: 500, body: 'Error triggering Mailchimp customer journey' };
    }
};

