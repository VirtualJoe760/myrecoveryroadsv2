const axios = require('axios');
const querystring = require('querystring'); // Ensure querystring is required

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parsing form data
    const formData = querystring.parse(event.body);

    // Extracting journey ID and email address from form data
    const journeyId = [formData.journey]; // Make sure it's not an array
    const emailAddress = formData.emailAddress;

    // Log Journey and Email
    console.log('Extracted Journey ID:', journeyId);
    console.log('Extracted email:', emailAddress);

    if (!journeyId) {
      console.error('Journey ID missing');
      return { statusCode: 400, body: 'Journey ID missing' };
    }

    if (!emailAddress) {
      console.error('Email Address missing');
      return { statusCode: 400, body: 'Email Address missing' };
    }


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

    console.log('Mailchimp response:', response.data);
    return { statusCode: 200, body: JSON.stringify(response.data) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: `Error triggering Mailchimp customer journey: ${error.message}` };
  }
};
