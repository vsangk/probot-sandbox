const { lint, load } = require('@commitlint/core');
const config = require('./config');

exports.updateCommitStatus = async (context, commitTitle) => {
  const repo = context.repo();
  const { sha } = context.payload.pull_request.head;
  const statusInfo = { ...repo, sha, context: 'commitbot' };
  const { repos } = context.github; // GH API

  // Init pending status
  await repos.createStatus({
    ...statusInfo,
    state: 'pending',
    description: 'Waiting for commit title status to be reported',
  });

  // Update status
  try {
    const title = commitTitle
      ? commitTitle
      : context.payload.pull_request.title;
    const { rules } = await load(config);
    const { valid, errors, warnings } = await lint(title, rules);
    await repos.createStatus({
      ...statusInfo,
      state: valid ? 'success' : 'failure',
      description: `Found ${errors.length} errors, ${warnings.length} warnings`,
    });
  } catch (error) {
    console.log(`Problem updating commit status: ${error}`);
    await repos.createStatus({
      ...statusInfo,
      state: 'failure',
      description: `Internal error updating commit status`,
    });
  }
};
