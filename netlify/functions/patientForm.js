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
            tags: formData.tags ? [formData.tags] : [] // Using form data for tags
        };

        const url = `https://us21.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`;
        const apiKey = process.env.MAILCHIMP_API_KEY;
        const journeyUrl = 'https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/3120/steps/25234/actions/trigger';


        // Sending data to Mailchimp
        const contactResponse = await axios.post(url, data, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        // Add contact to Mailchimp
        await axios.post(mailchimpAPI, mailchimpData, { headers: mailchimpHeaders });

        // Trigger the customer journey
        const journeyId = formData.journey;  // Assuming journey ID is part of form data
        const journeyAPI = `https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/${journeyId}/contacts`;
        await axios.post(journeyAPI, { email_address: formData.emailAddress }, { headers: mailchimpHeaders });

        // Call patient-mailer function
        await axios.post('/.netlify/functions/patient-mailer', formData, { headers: { 'Content-Type': 'application/json' } });

        return { statusCode: 200, body: 'Contact added to Mailchimp, journey triggered, and email sent' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'Error processing the request' };
    }
};