const request = require('request');
const util = require('util');

const post = util.promisify(request.post);

async function markAsRead(messageId, senderId, auth) {
  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/mark_read.json',
    form: {
      last_read_event_id: messageId,
      recipient_id: senderId,
    },
    oauth: auth,
  };

  await post(requestConfig);
}

class MessageCreate {
  constructor(event = {direct_message_events: [{message_create: {}}]}) {
    this.message = {message_create: {}};
    if (!Array.isArray(event.direct_message_events)) {
      return;
    }
  
    const message = event.direct_message_events.shift();
  
    // Filter out empty messages or non-message events
    if (typeof message === 'undefined' || typeof message.message_create === 'undefined') {
      return;
    }
    
    this.message = message;
  }

  static fromStep(step) {
    const message = new MessageCreate();
    message.text = step.text;

    if (step.options) {
      message.metadata = step.options;
    }
    
    return message;
  }

  toJSON() { return this.message; }
  toString() {return JSON.stringify(this.message); }
  toObject() {return this.message;}

  get senderId() {
    return this.isValid() ? this.message.message_create.sender_id : null;
  }

  get recipientId() {
    return this.isValid() ?
      this.message.message_create.target.recipient_id :
      null;
  }

  set recipientId(id) {
    this.message.message_create.target = this.message.message_create.target || {};
    this.message.message_create.target.recipient_id = id;
  }

  isValid() {
    return typeof this.message.message_create.message_data !== 'undefined' &&
      typeof this.message.message_create.message_data.text !== 'undefined';
  }

  set metadata(data) {
    if (data === null) {
      delete this.message.message_create.message_data.quick_reply;
      return;
    }

    if (!Array.isArray(data)) {
      return;
    }

    this.message.message_create.message_data = this.message.message_create.message_data || {};
    this.message.message_create.message_data.quick_reply = {
      type: 'options',
      options: data,
    };
  }
  
  get metadata() {
    if (!this.isValid()) {
      return null;
    }

    if (!this.message.message_create.message_data.quick_reply) {
      return null;
    }

    return this.message.message_create.message_data.quick_reply;
  }

  get responseMetadata() {
    if (!this.isValid()) {
      return null;
    }

    if (!this.message.message_create.message_data.quick_reply_response) {
      return null;
    }
    try {
      return JSON.parse(this.message.message_create.message_data.quick_reply_response.metadata);
    } catch (e) {
      return this.message.message_create.message_data.quick_reply_response.metadata;
    }
  }

  get text() {
    return this.isValid() ? this.message.message_create.message_data.text : null;
  }

  set text(text) {
    this.message.message_create.message_data = this.message.message_create.message_data || {};
    this.message.message_create.message_data.text = text;
  }
}

async function indicateTyping(senderId, auth) {
  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/indicate_typing.json',
    form: {
      recipient_id: senderId,
    },
    oauth: auth,
  };

  await post(requestConfig);
}

async function readAndIndicateTyping(message, oauth) {
  const oAuthConfig = {
    token: oauth.oauth_token,
    token_secret: oauth.oauth_token_secret,
    consumer_key: oauth.consumer_key,
    consumer_secret: oauth.consumer_secret,
  };
  await markAsRead(message.message_create.id, message.message_create.sender_id, oAuthConfig);
  await indicateTyping(message.message_create.sender_id, oAuthConfig);
}

async function sendMessage(message, oauth) {
  const oAuthConfig = {
    token: oauth.oauth_token,
    token_secret: oauth.oauth_token_secret,
    consumer_key: oauth.consumer_key,
    consumer_secret: oauth.consumer_secret,
  };

  const requestConfig = {
    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
    oauth: oAuthConfig,
    json: {
      event: {
        type: 'message_create',
        message_create: message.message.message_create,
      },
    },
  };

  return await post(requestConfig);
}

module.exports = {MessageCreate, sendMessage};