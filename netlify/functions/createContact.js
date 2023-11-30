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
    console.log('First Event:', event)

    try {
        const formData = querystring.parse(event.body);
        const email = formData.emailAddress;
        const firstName = formData.firstName || 'joe';
        const lastName = formData.lastName || 'sardella';
        const insurance = formData.insurance || 'none'; // Default to 'none' if not provided
        const memberID = formData.memberID || 'none'; // Default to 'none' if not provided
        const groupNumber = formData.groupNumber || 'none'; // Default to 'none' if not provided
        const phone = formData.phone || 'none'; // Default to 'none' if not provided
        cosnt orgName = formData.orgName || 'MRR Partner';

        const data = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
                ORGNAME: orgName,
                PHONE: phone,
                INSURANCE: insurance,
                MEMBERID: memberID,
                GROUPNUM: groupNumber
            },
            tags: formData.tags ? [formData.tags] : [] // Using form data for tags
        };

        console.log('Extracted email:', email);
        console.log('Here is the Data:', data);


        // Sending data to Mailchimp
        const url = `https://us21.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`;
        const apiKey = process.env.MAILCHIMP_API_KEY;
        const contactResponse = await axios.post(url, data, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        
        let journeyID, stepID; // Define journey ID
        const tags = formData.tags;
        console.log('Tags are:', tags)

        if (tags === "Applied") {
            journeyID = process.env.APPLIED_JOURNEY;
            stepID = process.env.APPLIED_STEP;
        } else if (tags === "businessPartner") {
            journeyID = process.env.PARTNER_JOURNEY;
            stepID = process.env.PARTNER_STEP;
        } else if (tags === "storyTeller") {
            journeyID = process.env.STORY_JOURNEY;
            stepID = process.env.STORY_STEP;
        }


        if (journeyID && stepID) {
            const journeyAPI = `https://us21.api.mailchimp.com/3.0/customer-journeys/journeys/${journeyID}/steps/${stepID}/actions/trigger`;
        
            const mailchimpHeaders = {
                'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
            };
        
            await axios.post(journeyAPI, { email_address: formData.emailAddress }, { headers: mailchimpHeaders });
            
            console.log('Journey API is:', journeyAPI);
            console.log('headers are:', mailchimpHeaders);
        }
        

        console.log('Journey ID is:', journeyID);
        console.log('Step ID is:', stepID);

        return { statusCode: 200, body: 'Form processed successfully' };


    } catch (err) {

        console.error('Error in extracting form data:', err);
        return { statusCode: 500, body: 'Error in extracting form data' };
    }
};