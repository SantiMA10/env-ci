// https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
const { parseBranch } = require("../lib/utils.js");

const getPrEvent = ({ env }) => {
  try {
    const event = env.GITHUB_EVENT_PATH ? require(env.GITHUB_EVENT_PATH) : undefined;

    if (event && event.pull_request) {
      return {
        branch: event.pull_request.base ? parseBranch(event.pull_request.base.ref) : undefined,
        pr: event.pull_request.number,
      };
    }
  } catch {
    // Noop
  }

  return { pr: undefined, branch: undefined };
};

const getPrNumber = (env) => {
  const event = env.GITHUB_EVENT_PATH ? require(env.GITHUB_EVENT_PATH) : undefined;
  return event && event.pull_request ? event.pull_request.number : undefined;
};

module.exports = {
  detect({ env }) {
    return Boolean(env.GITHUB_ACTIONS);
  },
  configuration({ env, cwd }) {
    const isPr = env.GITHUB_EVENT_NAME === "pull_request" || env.GITHUB_EVENT_NAME === "pull_request_target";
    const branch = parseBranch(
      env.GITHUB_EVENT_NAME === "pull_request_target" ? `refs/pull/${getPrNumber(env)}/merge` : env.GITHUB_REF
    );

    return {
      name: "GitHub Actions",
      service: "github",
      commit: env.GITHUB_SHA,
      build: env.GITHUB_RUN_ID,
      buildUrl: `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/runs/${env.GITHUB_RUN_ID}`,
      isPr,
      branch,
      prBranch: isPr ? branch : undefined,
      slug: env.GITHUB_REPOSITORY,
      root: env.GITHUB_WORKSPACE,
      ...(isPr ? getPrEvent({ env, cwd }) : undefined),
    };
  },
};
