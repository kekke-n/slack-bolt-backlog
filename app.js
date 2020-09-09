require('dotenv').config();
const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
// app.message('hello', async ({ message, say }) => {
//   // say() sends a message to the channel where the event was triggered
//   await say(`Hey there <@${message.user}>!`);
// });

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

app.action({ callback_id: 'report_bug'}, async({action, ack}) => {
  await ack();
  await say('登録しました');
});


// open_modal というグローバルショートカットはシンプルなモーダルを開く
app.shortcut('report_bug', async ({ shortcut, ack, context }) => {
  // グローバルショートカットリクエストの確認
  ack();

  try {
    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
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
          // {
          //   "type": "section",
          //   "text": {
          //     "type": "mrkdwn",
          //     "text": "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
          //   }
          // },
          // {
          //   "type": "context",
          //   "elements": [
          //     {
          //       "type": "mrkdwn",
          //       "text": "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
          //     }
          //   ]
          // }
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
  // Start your app
  await app.start(process.env.PORT || 3020);

  console.log('⚡️ Bolt app is running!');
})();
