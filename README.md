# bitbucket-slack-connector

Bot to keep code review participants on the same field by broadcasting pull requests events to the Slack.
Built on top of [Slack bolt API](https://slack.dev/bolt-js/tutorial/getting-started)

### Configuring dev environment

- Install [Node.js and npm](https://nodejs.org) on your machine
- Run `npm i` from the repo root directory

### Running unit tests

- Easy as ```npm run test```. Unit tests are not tied to Slack or Bitbucket, thus, you can run without real setup.
- Since I'm a lazy guy, tests use snapshots. You can update them by running ```npm run test:update-snapshots```

### Running app

- Configure Slack application to get required tokens. You can use "Create an app" and "Tokens and installing apps"
  sections [from this Slack guide](https://slack.dev/bolt-js/tutorial/getting-started#create-an-app). You can
  use `./slack_app_manifest.yml` file as a basis to create your own app and assign all the required oauth scopes.
- Create the copy of `.env.example` file, name it `.env` and provide relevant config values. `BITBUCKET_READ_API_TOKEN`
  is optional and needed only to fetch commit message when notifying about new commit to the pull request.
- Run ```npm run start```

### Running e2e-tests with an app

- e2e tests will require real Slack and Bitbucket connections. Please refer to [Running app](#running-app)
  section above.
- e2e-tests are implemented with [HTTP Client CLI](https://www.jetbrains.com/help/idea/http-client-cli.html). Thus, it
  should be installed.
- Fill `http-client.env.json` file with parameters you find relevant. If you want to use real data, consider creating
  your own `http-client.private.env.json` config. It is added to the `.gitignore`
- Run ```ijhttp .e2e-tests/e2e-test-requests.http``` from the project root directory.

### Running the service

- You can use provided `Dockerfile` to build an image and run it with ENV variables identical to variables
  specified in `.env.example` described above
- Please, be aware that _service is stateful_ since it caches channels and comments info. State stored in memory (
  see `SlackAPIAdapterCachedDecorator`), that keeps implementation simple and efficiently serves
  hundreds of pull requests. In case of service restart, cache will be gracefully restored. However,
  if you need to run multiple instances or experience `Slack API` requests limit exceeding, you'll need to implement
  some external cache.    
### Useful links
- [Slack apps configuration page](https://api.slack.com/apps)
- [Slack blocks kit builder](https://app.slack.com/block-kit-builder) and [full controls reference](https://api.slack.com/reference/block-kit/block-elements)
