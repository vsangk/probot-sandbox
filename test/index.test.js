const { Application } = require("probot");
// Requiring our app implementation
const myProbotApp = require("../src");

const issuesOpenedPayload = require("./fixtures/issues.opened.json");

xdescribe("My Probot app", () => {
  let app, github;

  beforeEach(() => {
    app = new Application();
    // Initialize the app based on the code from index.js
    app.load(myProbotApp);
    // This is an easy way to mock out the GitHub API
    github = {
      issues: {
        createComment: jest.fn().mockReturnValue(Promise.resolve({}))
      },
      pull_request: {
        update: jest.fn().mockResolvedValue({})
      }
    };
    // Passes the mocked out GitHub API into out app instance
    app.auth = () => Promise.resolve(github);
  });

  test("creates a comment when an issue is opened", async () => {
    // Simulates delivery of an issues.opened webhook
    await app.receive({
      name: "issues.opened",
      payload: issuesOpenedPayload
    });

    // This test passes if the code in your index.js file calls `context.github.issues.createComment`
    expect(github.issues.createComment).toHaveBeenCalled();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/
