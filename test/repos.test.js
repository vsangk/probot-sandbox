const { updateCommitStatus } = require('../src/repos');

describe('updateCommitStatus', () => {
  let context;
  let statusInfo;

  beforeEach(() => {
    context = {
      repo: jest.fn().mockReturnValue({}),
      payload: {
        pull_request: {
          head: {
            sha: 'sha_value',
          },
          title: 'fix: my fix',
        },
      },
      github: {
        repos: {
          createStatus: jest.fn().mockResolvedValue({}),
        },
      },
    };

    statusInfo = { sha: 'sha_value', context: 'commitbot' };
  });

  it('starts by sending an initial pending status', async () => {
    await updateCommitStatus(context);
    expect(context.github.repos.createStatus).toHaveBeenNthCalledWith(1, {
      ...statusInfo,
      state: 'pending',
      description: 'Waiting for commit title status to be reported',
    });
  });

  describe('when the commit status is a success', () => {
    it('sends a success status', async () => {
      await updateCommitStatus(context, 'fix: valid commit title');
      expect(context.github.repos.createStatus).toHaveBeenLastCalledWith({
        ...statusInfo,
        state: 'success',
        description: 'Found 0 errors, 0 warnings',
      });
    });
  });

  describe('when the commit status is a failure', () => {
    it('sends a failure status on a bad commit title', async () => {
      await updateCommitStatus(context, 'invalid commit');
      expect(context.github.repos.createStatus).toHaveBeenLastCalledWith({
        ...statusInfo,
        state: 'failure',
        description: 'Found 2 errors, 0 warnings',
      });

      await updateCommitStatus(context, 'fix: ');
      expect(context.github.repos.createStatus).toHaveBeenLastCalledWith({
        ...statusInfo,
        state: 'failure',
        description: 'Found 1 errors, 0 warnings',
      });
    });
  });
});
