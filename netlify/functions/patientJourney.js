const client = require("@mailchimp/mailchimp_marketing");

client.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: "us21",
});

const journeyId = 3120;

const getJourneyStepId = async (journeyId) => {
  try {
    const response = await client.customerJourneys.get(journeyId);
    // Assuming you want the first step or a specific step
    const stepId = response.steps[0].id; // or use some condition to find the specific step
    return stepId;
  } catch (error) {
    console.error('Error fetching journey details:', error);
    throw error;
  }
};


const run = async () => {
  const response = await client.customerJourneys.trigger(journeyId, stepId, {
    email_address: emailAddress,
  });
  console.log(response);
};

run();