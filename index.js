const {Autohook, validateWebhook} = require('twitter-autohook');
const {RateLimitError} = require('twitter-autohook/errors');

const ngrok = require('ngrok');
const {sendMessage, MessageCreate, readAndIndicateTyping} = require('./twitter_dm');
const Agent = require('./agent');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4242;

const webhookEndpoint = '/webhook/covid';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.use(express.json());
app.use(express.static("public"));

app.all(webhookEndpoint, async (request, response) => {
  const oauth = {
    oauth_token: process.env.TWITTER_DM_USER_ACCESS_TOKEN,
    oauth_token_secret: process.env.TWITTER_DM_USER_ACCESS_TOKEN_SECRET,
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  };

  if (request.query.crc_token) {
    const signature = validateWebhook(request.query.crc_token, {consumer_secret: process.env.TWITTER_CONSUMER_SECRET});
    response.json(signature);
  } else {
    response.sendStatus(200);
    const message = new MessageCreate(request.body);

    // Filter out messages created by the the authenticating users (to avoid reacting to the bot's own messages)
    const [chatbotUserId] = oauth.oauth_token.split('-');

    if (message.senderId === chatbotUserId) {
      return;
    }

    if (message.senderId === message.recipientId) {
      return;
    }

    if (!message.isValid()) {
      return;
    }
    
    await readAndIndicateTyping(message, oauth);
    const agent = new Agent();

    try {
      const metadata = message.responseMetadata;
      if (metadata) {
        agent.step(metadata);
      } 
    } catch (e) {
      console.error(e);
    }  

    const step = agent.currentStep();
    if (!step) {
      return;
    }

    const out = MessageCreate.fromStep(step);
    out.recipientId = message.senderId;
    try {
      await sendMessage(out, oauth);
    } catch (e) {
      console.error('An error occurred while sending a message back this user:', e);
    }
    
  }
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

(async () => {
  let url = null;
  const webhook = new Autohook({
    token: process.env.TWITTER_ACCESS_TOKEN,
    token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    env: process.env.TWITTER_WEBHOOK_ENV});


  if (process.env.PROJECT_DOMAIN) {
    url = `https://${process.env.PROJECT_DOMAIN}.${process.env.PROJECT_BASE_URL || 'glitch.me'}`;
  } else {
    url = await ngrok.connect(PORT);
  }

  const webhookURL = `${url}${webhookEndpoint}`;

  const setWebhook = async () => {
    const existingHooks = await webhook.getWebhooks();
    const ngrokWebhooks = existingHooks.filter(hook => hook.url.match(/ngrok/));
    ngrokWebhooks.forEach(hook => webhook.removeWebhook(hook));

    const existingWebhooks = existingHooks.some(hook => hook.url.indexOf(webhookURL) > -1);
    if (!existingWebhooks) {
      await webhook.start(webhookURL);
      await webhook.subscribe({
        oauth_token: process.env.TWITTER_DM_USER_ACCESS_TOKEN,
        oauth_token_secret: process.env.TWITTER_DM_USER_ACCESS_TOKEN_SECRET,
      });
    }
  }

  app.listen(PORT, async () => {
    console.log('listen')
    try {
      await setWebhook();
    } catch(e) {
      console.error(e);
      if (e instanceof RateLimitError) {
        console.log('Incurred in rate limiting. Waiting until rate limit resets.');
        await sleep(e.resetAt - Date.now());
      }
      process.exit(-1);
    }
  });
})();

