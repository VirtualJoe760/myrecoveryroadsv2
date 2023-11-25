const axios = require('axios');

exports.handler = async (event) => {
    const formData = JSON.parse(event.body);
    const {
        email,
        firstName,
        lastName,
        tags,
        'Email Address': emailAddress,
        Subject,
        Story,
        'Organization Name': organizationName,
        'Phone Number': phoneNumber,
        'Business Address': businessAddress,
        'Business Message': businessMessage,
        'front-upload': frontUpload,
        'back-upload': backUpload,
        memberID,
        groupNumber,
        insurance
    } = formData;

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    let notes = '';
    if (Story) {
        notes += `Story: ${Story}\n`;
    }
    if (businessMessage) {
        notes += `Business Message: ${businessMessage}\n`;
    }
    if (frontUpload) {
        notes += `Front of Insurance Card: ${frontUpload}\n`;
    }
    if (backUpload) {
        notes += `Back of Insurance Card: ${backUpload}\n`;
    }

    const data = {
        email_address: email || emailAddress,
        status: 'subscribed',
        tags: tagsArray,
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
            PHONE: phoneNumber,
            ADDRESS: businessAddress || insurance,
            MEMBERID: memberID,
            GROUPNUM: groupNumber,
            ORGNAME: organizationName,
            SUBJECT: Subject,
            NOTES: notes
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
