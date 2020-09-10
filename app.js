require('dotenv').config();
const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.shortcut('report_bug', async ({ shortcut, ack, context }) => {
  ack();

  try {
    const result = await app.client.views.open({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        "type": "modal",
        "callback_id": 'report_issue',
        "title": {
          "type": "plain_text",
          "text": "Report Bug"
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true,
        },
        "close": {
          "type": "plain_text",
          "text": "Close"
        },
        "blocks": [
          {
            "type": "input",
            "block_id": "title",
            "label": {
              "type": "plain_text",
              "text": "Title"
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "plain_input",
              "placeholder": {
                "type": "plain_text",
                "text": "Enter some plain text"
              }
            }
          },
          {
            "type": "input",
            "block_id": "description",
            "label": {
              "type": "plain_text",
              "text": "Description"
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "plain_input",
              "multiline": true,
              "initial_value": shortcut.message.text,
              "placeholder": {
                "type": "plain_text",
                "text": "Enter some plain text"
              }
            },
          },
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.view('report_issue', async ({ ack, body, view, context }) => {
  await ack();

  const title = view.state.values.title.plain_input.value;
  const description = view.state.values.description.plain_input.value;
  createIssue(title, description);
  try {
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: {
        "type": "modal",
        "callback_id": 'report_issue',
        "title": {
          "type": "plain_text",
          "text": "Report Bug"
        },
        "close": {
          "type": "plain_text",
          "text": "Close"
        },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Reported Bug."
            }
          },
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 3020);

  console.log('⚡️ Bolt app is running!');
})();

function createIssue(title, description) {
  try { // 通常時の処理
    var base_url = process.env.BACKLOG_BASE_URL
    var endpoint = base_url + '/api/v2/issues';
    var apiKey = process.env.BACKLOG_API_KEY;
    var url = endpoint + '?' + 'apiKey=' + apiKey;
    var users_id = process.env.BACKLOG_USRE_ID;
    var params = {
      'projectId': process.env.BACKLOG_PROJECT_ID,
      'summary': title,
      'issueTypeId': process.env.ISSUE_TYPE_ID,
      'priorityId': 2, // 優先度中
      'description': description,
      'notifiedUserId[]' : users_id,
      'assigneeId': users_id
    }
    var options = {
      uri: url,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      form: params
    };
    var request = require('request');
    var issue_url = ''
    request.post(options, function(error, response, body){});
  } catch (error) {
    console.error(error);
  }

}
