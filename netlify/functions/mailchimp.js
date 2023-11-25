const axios = require('axios');

exports.handler = async (event) => {
    const { email, firstName, lastName } = JSON.parse(event.body);

    const data = {
        email_address: email,
        status: 'subscribed',
        tags: ['shareStory', 'Applied', 'partnerApplication', 'patientApplication'],
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
        },
    };

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const DC = MAILCHIMP_API_KEY.split('-')[1];

    const url = `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;

    try {
        await axios.post(url, data, {
            headers: {
                'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        return {
            statusCode: 200,
            body: 'Subscriber added.'
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify(error.response.statusText)
        };
    };
};
