const repos = require('./repos');
const pullRequests = require('./pullRequests');

/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!');

  app.on('issues.opened', async context => {
    app.log('issues hook');
    const issueComment = context.issue({
      body: 'Thanks for opening this issue!',
    });
    return context.github.issues.createComment(issueComment);
  });

  app.on(['pull_request.opened'], async context => {
    app.log('pr hook');
    const title = await pullRequests.updateTitle(context);
    await repos.updateCommitStatus(context, title);
  });

  app.on(['pull_request.edited', 'pull_request.synchronize'], async context => {
    const title = context.payload.pull_request.title;
    await repos.updateCommitStatus(context, title);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
