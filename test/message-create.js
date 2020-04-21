const {MessageCreate} = require('../twitter_dm');
const Agent = require('../agent');
const assert = require('assert');

(() => {
  const body = {"for_user_id":"138545742","direct_message_events":[{"type":"message_create","id":"1244769172757741572","created_timestamp":"1585611072135","message_create":{"target":{"recipient_id":"138545742"},"sender_id":"1148705259977469952","message_data":{"text":"start","entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[]}}}}],"users":{"138545742":{"id":"138545742","created_timestamp":"1272576459000","name":"Rocodromo Stephenson","screen_name":"rocodromo","protected":false,"verified":false,"followers_count":30,"friends_count":3,"statuses_count":179,"profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png","profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"},"1148705259977469952":{"id":"1148705259977469952","created_timestamp":"1562707650678","name":"DanieleTheTestUser","screen_name":"DanieleUser","location":"In the cloud","description":"Protected, user-context, non-follower","protected":false,"verified":false,"followers_count":0,"friends_count":1,"statuses_count":38,"profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png","profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"}}};
  const messagePayload = body.direct_message_events[0].message_create;
  const message = new MessageCreate(body);

  assert.equal(message.isValid(), true);
  assert.equal(message.senderId, messagePayload.sender_id);
  assert.equal(message.recipientId, messagePayload.target.recipient_id);
  assert.equal(message.text, messagePayload.message_data.text);
  assert.equal(message.metadata, null);
  assert.equal(message.responseMetadata, null);
})();

(() => {
  const body = {"for_user_id":"138545742","direct_message_events":[{"type":"message_create","id":"1244791430335221764","created_timestamp":"1585616378755","message_create":{"target":{"recipient_id":"138545742"},"sender_id":"1148705259977469952","message_data":{"text":"Use for someone else","entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[]},"quick_reply_response":{"type":"options","metadata":"{\"goto\": \"todo\"}"}}}}],"users":{"138545742":{"id":"138545742","created_timestamp":"1272576459000","name":"Rocodromo Stephenson","screen_name":"rocodromo","protected":false,"verified":false,"followers_count":30,"friends_count":3,"statuses_count":179,"profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png","profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"},"1148705259977469952":{"id":"1148705259977469952","created_timestamp":"1562707650678","name":"DanieleTheTestUser","screen_name":"DanieleUser","location":"In the cloud","description":"Protected, user-context, non-follower","protected":false,"verified":false,"followers_count":0,"friends_count":1,"statuses_count":38,"profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png","profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"}}};  
  const messagePayload = body.direct_message_events[0].message_create;
  const message = new MessageCreate(body);

  assert.equal(message.isValid(), true);
  assert.equal(message.senderId, messagePayload.sender_id);
  assert.equal(message.recipientId, messagePayload.target.recipient_id);
  assert.equal(message.text, messagePayload.message_data.text);
  assert.deepStrictEqual(message.responseMetadata, JSON.parse(messagePayload.message_data.quick_reply_response.metadata));
})();

(() => {
  const body = {"for_user_id":"138545742","direct_message_indicate_typing_events":[{"created_timestamp":"1585613220783","sender_id":"1148705259977469952","target":{"recipient_id":"138545742"}}],"users":{"138545742":{"id":"138545742","created_timestamp":"1272576459000","name":"Rocodromo Stephenson","screen_name":"rocodromo","protected":false,"verified":false,"followers_count":30,"friends_count":3,"statuses_count":179,"profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png","profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"},"1148705259977469952":{"id":"1148705259977469952","created_timestamp":"1562707650678","name":"DanieleTheTestUser","screen_name":"DanieleUser","location":"In the cloud","description":"Protected, user-context, non-follower","protected":false,"verified":false,"followers_count":0,"friends_count":1,"statuses_count":38,"profile_image_url":"http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png","profile_image_url_https":"https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"}}}
  const message = new MessageCreate(body);
  assert.equal(message.isValid(), false);
})();

(() => {
  const agent = new Agent();
  agent.step('scripts/en-us/main.yaml#start');
  const message = MessageCreate.fromStep(agent.currentStep());
  assert.equal(message.isValid(), true);
  assert.equal(message.text, agent.script.start.text);
  assert.deepStrictEqual(message.metadata.options, agent.script.start.options);
})();