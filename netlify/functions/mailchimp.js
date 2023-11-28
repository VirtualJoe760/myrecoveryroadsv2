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

    const formData = querystring.parse(event.body);

    // Configure Mailchimp API
    const mailchimpAPI = `https://us21.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`;
    const mailchimpHeaders = {
        'Authorization': `Basic ${Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
    };
    console.log('Mailchimp API:', mailchimpAPI);

    try {
        // Mailchimp API request to add contact
        const mailchimpData = {
            email_address: formData.emailAddress,
            status: 'subscribed',
            merge_fields: {
                FNAME: formData.firstName,
                LNAME: formData.lastName,
                ORGNAME: formData.orgName,
                ADDRESS: formData.busAddress,
                PHONE: formData.phone,
                INSURANCE: formData.insurance,
                MEMBERID: formData.memberID,
                GROUPNUMBER: formData.groupNumber,
                BUSINESSTYPE: formData.businessTypeRadial,
            },
            tags: formData.tags ? [formData.tags] : []
        };
        console.log('Mailchimp data:', mailchimpData);

        await axios.post(mailchimpAPI, mailchimpData, { headers: mailchimpHeaders });

        let journeyID, stepID; // Define journey ID
        const mcTags = formData.tags;

        if (mcTags === "Applied") {
            journeyID = process.env.JOURNEY_APPLIED;
            stepID = process.env.STEP_APPLIED;
        } else if (mcTags === "businessPartner") {
            journeyID = process.env.PARTNERY_JOURNEY;
            stepID = process.env.PARTNER_STEP;
        } else if (mcTags === "storyTeller") {
            journeyID = process.env.STORY_JOURNEY;
            stepID = process.env.STORY_STEP;
        }
        
        const journeyAPI = `https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/${journeyID}/steps/${stepID}/actions/trigger`;
        await axios.post(journeyAPI, { email_address: formData.emailAddress }, { headers: mailchimpHeaders });

        return { statusCode: 200, body: 'Form processed successfully' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: `Error processing the request: ${error.message}` };
    }
};