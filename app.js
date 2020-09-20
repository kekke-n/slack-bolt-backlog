require('dotenv').config();
const { App } = require('@slack/bolt');
const Request = require('request');
const Fs = require('fs');


// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.shortcut('report_bug', async ({ shortcut, ack, context }) => {
  ack();

  var dateString = formatDate();
  shortcut.message.files.forEach((f, i) => {
    var fileName = dateString + '_' + i + '_' + f.name;
    dowonloadFile(f.url_private, fileName);
  });
  try {
    var responses = [];
    await registerAttachment().then((result) => {
      responses = result
    });
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

async function registerAttachment(){
  var async = require('async');
  var fs = Fs
  var reponses = []

  var base_url = process.env.BACKLOG_BASE_URL
  var endpoint = base_url + '/api/v2/space/attachment';
  var apiKey = process.env.BACKLOG_API_KEY;
  var url = endpoint + '?' + 'apiKey=' + apiKey;

  files = fs.readdirSync('tmp/files')
  for(let i = 0 ; i < files.length; i++){
    var f = files[i]
    var data = fs.readFileSync('tmp/files/' + f)
    options = {
      method: "POST",
      uri: url,
      multipart: [
        {
          'Content-Disposition': 'form-data; name="file"; filename="' + f + '"',
          'Content-Type': 'application/octet-stream',
          'body': data
        }
      ]
    }

    async function postFile(options){
      var rp = require('request-promise');
      return new Promise(async (resolve, reject) => {
        rp(options)
          .then(function (body) {
              resolve(body);
          })
          .catch(function (err) {
              reject(err);
          });
      });
    }
    await postFile(options).then((response) => {
      reponses.push(response)
    });
  }
  promise = new Promise(async (resolve) => {
    resolve(reponses);
  })
  return promise;
}

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

function dowonloadFile(url, fileName){
  // 出力ファイル名を指定
  var dir = 'tmp/files/'
  var outFile = Fs.createWriteStream(dir + fileName);
  var token = process.env.USER_TOKEN;

  var options = {
    'url': url,
    'headers': {
      'Authorization': "Bearer " + token
    }
  };

  Request.get(options).pipe(outFile);
}

function formatDate(date=(new Date()), format_str=('YYYYMMDDhhmmss')){
  format_str = format_str.replace(/YYYY/g, date.getFullYear());
  format_str = format_str.replace(/MM/g, date.getMonth());
  format_str = format_str.replace(/DD/g, date.getDate());
  format_str = format_str.replace(/hh/g, date.getHours());
  format_str = format_str.replace(/mm/g, date.getMinutes());
  format_str = format_str.replace(/ss/g, date.getSeconds());
  return format_str;
}
