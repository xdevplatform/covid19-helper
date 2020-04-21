const request = require('request');
const Agent = require('agent');
const util = require('util');
const {MessageCreate} = require('./twitter_dm');
const post = util.promisify(request.post);

const oAuthConfig = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_DM_USER_ACCESS_TOKEN,
  token_secret: process.env.TWITTER_DM_USER_ACCESS_TOKEN_SECRET,
};

async function createWelcomeMessage(message, oauth) {

  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/new.json',
    oauth: oauth,
    json: {
      welcome_message: {
        message_data: message.message.message_create.message_data,
      },
    },
  };

  return await post(requestConfig);
}

(async () => {
  const agent = new Agent();
  agent.loadFile('scripts/en-us/main.yaml#start');
  const message = MessageCreate.fromStep(agent.currentStep());
  const res = await createWelcomeMessage(message, oAuthConfig);

  if (res.body.welcome_message) {
    const [recipientId] = oAuthConfig.token.split('-');
    const messageId = res.body.welcome_message.id;
    const url = `https://twitter.com/messages/compose?recipient_id=${recipientId}&welcome_message_id=${messageId}`;
    console.log(url);
  } else {
    console.log(res.body);
  }
})();