const axios = require('axios');

exports.handler = async (event) => {
    const formData = JSON.parse(event.body);
    const { email, firstName, lastName, tags } = formData;

    // Split tags string into an array if it's not empty
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const data = {
        email_address: email,
        status: 'subscribed',
        tags: tagsArray,
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
            // Add other merge fields here as needed
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
