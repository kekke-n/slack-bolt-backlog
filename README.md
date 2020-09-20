# How to set up environment

## Set `.env`

- Create `.env`.
```
toucth .env
```
- Set the following environment variable.
```
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
BACKLOG_BASE_URL=
BACKLOG_API_KEY=
BACKLOG_SPACE_ID=
BACKLOG_PROJECT_ID=
BACKLOG_USRE_ID=
ISSUE_TYPE_ID=
USER_TOKEN=
```

## Crete `tmp/files` directory

```
mkdir -p tmp/files
```

## Install package

- install node packages.
```
npm install
```


## Run nodejs

node : v12.16.2

```
node app.js
```


# Reference

https://slack.dev/bolt-js/ja-jp/tutorial/getting-started
