# bitbucket-slack-connector

Bot to keep code review participants on the same field by broadcasting pull requests events to the dedicated
Slack-channel.
Built on top of [Slack bolt API](https://slack.dev/bolt-js/tutorial/getting-started)

### Configuring dev environment

- Install [Node.js and npm](https://nodejs.org) on your machine
- Run `npm i` from the repo root directory

### Running unit tests

- Easy as ```npm run test```. Unit tests are not tied to Slack or Bitbucket, thus, you can run without real setup.
- Tests use snapshots. You can update them by running ```npm run test:update-snapshots```

### Running locally

- Configure Slack application to get required tokens. You can use "Create an app" and "Tokens and installing apps"
  sections [from this Slack guide](https://slack.dev/bolt-js/tutorial/getting-started#create-an-app). You can
  use `./slack_app_manifest.yml` file as a basis to create your own app and assign all the required oauth scopes.
- Create the copy of `.env.example` file, name it `.env` and provide relevant config values
- Run ```npm run start```

### Running e2e-tests

- e2e tests will require real Slack and Bitbucket connections. Please refer to [Running locally](#running-locally)
  section above.
- [HTTP Client CLI](https://www.jetbrains.com/help/idea/http-client-cli.html) is used to run e2e tests. Thus, it should
  be installed.
- After installing, you can run ```ijhttp e2e-test-run/myrequest.http``` from the project root directory, and it will
  run all the e2e-tests with the configured Slack and Bitbucket credentials.

### Running the service

- You can use provided `Dockerfile` to build an image and run it with provided ENV variables identical to variables
  specified in `.env.example` described above
- Please, be aware that _service is stateful_ since it caches channels info. State stored in memory (
  see `SlackGatewayCachedDecorator`). In memory caching used to keep implementation simple and efficiently serve
  hundreds of pull requests. In case of service restart, cache will be gracefully restored. However,
  if you need to run multiple instances or experience `Slack API` request limits exceeding, you will need to provide
  some external cache.    