// patientForm.js
let fetch;

exports.handler = async (event, context) => {
    if (!fetch) {
        fetch = (await import('node-fetch')).default;
    }

    // Access environment variables for Mailchimp API and List ID
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const MAILCHIMP_SERVER_PREFIX = 'us21'; // Server prefix as provided

    // Hardcoded Journey and Step IDs
    const JOURNEY_ID = '3120';
    const STEP_ID = '23580';

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!event.body) {
        return { statusCode: 400, body: 'Bad Request: No form data' };
    }

    try {
        const form = JSON.parse(event.body);

        const mailchimpData = {
            email_address: form.emailAddress || 'example@example.com',
            status: 'subscribed',
            merge_fields: {
                FNAME: form.firstName || 'joe',
                LNAME: form.lastName || 'sardella',
                INSURANCE: form.insurance || 'none',
                MEMBERID: form.memberID || 'none',
                GROUPNUM: form.groupNumber || 'none',
                PHONE: form.phone || 'none'
            },
            tags: form.tags || ['default-tag']
        };

        // Construct Mailchimp API URL for adding a member
        const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

        // Add member to Mailchimp list
        const mailchimpResponse = await fetch(mailchimpUrl, {
            method: 'POST',
            body: JSON.stringify(mailchimpData),
            headers: {
                'Authorization': `Basic ${Buffer.from(`apikey:${MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!mailchimpResponse.ok) {
            throw new Error(`Mailchimp error: ${mailchimpResponse.statusText}`);
        }

        // Construct Mailchimp API URL for triggering a Customer Journey step
        const triggerUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/customer-journeys/journeys/${JOURNEY_ID}/steps/${STEP_ID}/actions/trigger`;

        // Trigger the specific step in Customer Journey
        const triggerResponse = await fetch(triggerUrl, {
            method: 'POST',
            body: JSON.stringify({ email_address: form.emailAddress }),
            headers: {
                'Authorization': `Basic ${Buffer.from(`apikey:${MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!triggerResponse.ok) {
            throw new Error(`Trigger Journey Step error: ${triggerResponse.statusText}`);
        }

        console.log('Form submitted and Customer Journey step triggered successfully');
        return { statusCode: 200, body: 'Form submitted and journey step triggered successfully' };
    } catch (error) {
        console.error('Error processing form submission:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
