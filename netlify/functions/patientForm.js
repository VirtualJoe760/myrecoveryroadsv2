const axios = require('axios');
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!event.body) {
        console.error('No event body in the request');
        return { statusCode: 400, body: 'No event body in the request' };
    }

    console.log('Type of event.body:', typeof event.body);
    console.log('Partial event body:', event.body.substring(0, 200));

    try {
        // Parsing form data
        const formData = querystring.parse(event.body);
        const emailAddress = formData.emailAddress; // Extracting emailAddress
        const firstName = formData.firstName || 'joe'; // Default to 'joe' if not provided
        const lastName = formData.lastName || 'sardella'; // Default to 'sardella' if not provided
        const insurance = formData.insurance || 'none'; // Default to 'none' if not provided
        const memberID = formData.memberID || 'none'; // Default to 'none' if not provided
        const groupNumber = formData.groupNumber || 'none'; // Default to 'none' if not provided
        const phone = formData.phone || 'none'; // Default to 'none' if not provided
        const mcTags = formData.tags || []; // Extracting tags

        console.log('Extracted email:', emailAddress);

        const data = {
            email_address: emailAddress,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
                PHONE: phone,
                INSURANCE: insurance,
                MEMBERID: memberID,
                GROUPNUM: groupNumber
            },
            tags: ["mcTags"]
        };

        const url = `https://us21.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`;
        const apiKey = process.env.MAILCHIMP_API_KEY;

        // Sending data to Mailchimp
        const contactResponse = await axios.post(url, data, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        // Extracting journey ID from form data
        const journeyId = formData.journey;
        if (!journeyId) {
            console.error('Journey ID is missing');
            return { statusCode: 400, body: 'Journey ID is missing' };
        }

        // Triggering the customer journey
        const journeyUrl = `https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/${journeyId}/contacts`;
        await axios.post(journeyUrl, { email_address: emailAddress }, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        return { statusCode: 200, body: 'Contact added to Mailchimp and journey triggered' };
    } catch (error) {
        console.error('Error:', error);
        // Specifically log the errors array if it exists in Mailchimp's response
        if (error.response && error.response.data && error.response.data.errors) {
            console.error('Mailchimp errors:', error.response.data.errors);
        }
        return { statusCode: 500, body: 'Error processing the request' };
    }
};
