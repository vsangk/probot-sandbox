const { lint, load } = require("@commitlint/core");
const config = require("./config");

exports.updateCommitStatus = async (context, commitTitle) => {
  const repo = context.repo();
  const { sha } = context.payload.pull_request.head;
  const statusInfo = { ...repo, sha, context: "sigfig-commit" };
  const { repos } = context.github; // GH API

  // Init pending status
  await repos.createStatus({
    ...statusInfo,
    state: "pending",
    description: "Waiting for commit title status to be reported"
  });

  // Update status
  const title = commitTitle ? commitTitle : context.payload.pull_request.title;
  const { rules } = await load(config);
  const { valid, errors, warnings } = await lint(title, rules);
  await repos.createStatus({
    ...statusInfo,
    state: valid ? "success" : "failure",
    description: `found ${errors.length} errors, ${warnings.length} warnings`
  });
};
