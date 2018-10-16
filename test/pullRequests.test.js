const pr = require("../src/pullRequests");

describe("isValidConventionalCommit", () => {
  it("returns true for valid conventional commit syntax", () => {
    expect(pr.isValidConventionalCommit("fix(POL-123): my fix")).toBe(true);
    expect(pr.isValidConventionalCommit("feat(POL-123): my change")).toBe(true);
    expect(pr.isValidConventionalCommit("chore: quick change")).toBe(true);
  });

  it("returns false for invalid commits", () => {
    expect(pr.isValidConventionalCommit("plain commit message")).toBe(false);
    expect(pr.isValidConventionalCommit("feat(POL-123) no semicolon")).toBe(
      false
    );
    expect(pr.isValidConventionalCommit("fix(POL-123):no space")).toBe(false);
  });
});

describe("featFirstCompare", () => {
  it("reorders if it's not a feat", () => {
    expect(
      pr.featFirstCompare("fix(POL-123): my fix", "feat(POL-123): my change")
    ).toBe(1);

    expect(
      pr.featFirstCompare("chore: quick change", "feat(POL-123): my change")
    ).toBe(1);

    expect(pr.featFirstCompare("plain commit")).toBe(1);
  });

  it("does nothing if feat is already first or both are feat", () => {
    expect(
      pr.featFirstCompare("feat(POL-123): my change", "fix(POL-123): my fix")
    ).toBe(0);

    expect(
      pr.featFirstCompare(
        "feat(POL-123): first change",
        "feat(POL-123): second change"
      )
    ).toBe(0);
  });
});

describe("updateTitle", () => {
  let context;
  let getCommitsMock = jest.fn();

  beforeEach(() => {
    context = {
      // normally the issue fn returns all the params associated to the issue and
      // if an argument is passed to it, it will override the property. this will just
      // mock it so we can check only the overridden property
      issue: jest.fn().mockImplementation(arg => arg),
      github: {
        pullRequests: {
          getCommits: getCommitsMock,
          update: jest.fn().mockResolvedValue({})
        }
      }
    };
  });

  it("makes a call to GitHub with the correct commit title", async () => {
    getCommitsMock.mockResolvedValueOnce({
      data: [
        {
          commit: {
            message: "wrong"
          }
        },
        {
          commit: {
            message: "fix(POL-123): my fix"
          }
        },
        {
          commit: {
            message: "feat(POL-123): my feature"
          }
        },
        {
          commit: {
            message: "chore: something else"
          }
        }
      ]
    });
    await pr.updateTitle(context);
    expect(context.github.pullRequests.update).toHaveBeenCalledWith({
      title: "feat(POL-123): my feature"
    });
  });

  it("does not make a call if no valid commit title is found", async () => {
    getCommitsMock.mockResolvedValueOnce({
      data: [
        {
          commit: {
            message: "wrong"
          }
        },
        {
          commit: {
            message: "plain commit message"
          }
        },
        {
          commit: {
            message: "feat(POL-123) no semicolon"
          }
        },
        {
          commit: {
            message: "fix(POL-123):no space"
          }
        }
      ]
    });
    await pr.updateTitle(context);
    expect(context.github.pullRequests.update).not.toHaveBeenCalled();
  });

  it("returns the title", async () => {
    getCommitsMock.mockResolvedValueOnce({
      data: [
        {
          commit: {
            message: "wrong"
          }
        },
        {
          commit: {
            message: "fix(POL-123): my fix"
          }
        },
        {
          commit: {
            message: "feat(POL-123): my feature"
          }
        },
        {
          commit: {
            message: "chore: something else"
          }
        }
      ]
    });
    const title = await pr.updateTitle(context);
    expect(title).toBe("feat(POL-123): my feature");
  });
});
