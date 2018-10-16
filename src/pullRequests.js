const isValidConventionalCommit = commit => {
  const conventionalCommitMatcher = /([a-z]+).*: .+/;
  const match = (conventionalCommitMatcher.exec(commit) || [])[0];
  return !!match;
};

// orders `feat:` commits first
const featFirstCompare = (a, b) => {
  const conventionalCommitMatcher = /([a-z]+).*: .+/;
  const typeA = (conventionalCommitMatcher.exec(a) || [])[1]; // capture group index for type
  const typeB = (conventionalCommitMatcher.exec(b) || [])[1];
  const isFeat = type => type === "feat";

  if (!typeA || !typeB || (isFeat(typeB) && !isFeat(typeA))) return 1;
  return 0;
};

const updateTitle = async context => {
  const pr = context.issue();
  const { pullRequests } = context.github; // GH API

  try {
    const commits = await pullRequests.getCommits(pr);
    const conventionalCommits = commits.data
      .map(c => c.commit.message)
      .filter(isValidConventionalCommit)
      .sort(featFirstCompare);

    // implement check: if valid and !feat, don't update
    const title = conventionalCommits[0];
    const updatedContext = context.issue({ title });
    title && (await pullRequests.update(updatedContext)); // only update if there's a valid title
    return title;
  } catch (error) {
    console.log(`Problem updating commit title: ${error}`);
  }
};

module.exports = {
  isValidConventionalCommit,
  featFirstCompare,
  updateTitle
};
