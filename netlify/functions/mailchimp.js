const axios = require('axios');

exports.handler = async (event) => {
    const { email, firstName, lastName } = JSON.parse(event.body);

    const data = {
        email_address: email,
        status: 'subscribed',
        tags: [shareStory, Applied, partnerApplication, patientApplication],
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
        },
    };

    const API_KEY = 423a73c3a78a72fd2f5f975397d94cfe-us21;
    const LIST_ID = 1e452e8302;
    const DC = 423a73c3a78a72fd2f5f975397d94cfe-us21.split('-')[1];

    const url = `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;

    try {
        await axios.post(url, data, {
            headers: {
                'Authorization': 'apikey ${MAILCHIMP_API_KEY}',
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