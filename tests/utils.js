const { ServerlessSDK } = require("@serverless/platform-client-china");
require("dotenv").config();
const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')

/*
 * Generate random id
 */
const generateId = () =>
  Math.random()
    .toString(36)
    .substring(6);

/*
 * Initializes and returns an instance of the serverless sdk
 * @param ${string} orgName - the serverless org name.
 */
const getServerlessSdk = () => {
  const sdk = new ServerlessSDK({
    skipRoleBinding: true,
    context: {},
  });
  return sdk;
};
const getCredentials = () => {
  const credentials = {
    tencent: {
      SecretId: process.env.TENCENT_SECRET_ID,
      SecretKey: process.env.TENCENT_SECRET_KEY,
    },
  };

  if (!credentials.tencent.SecretId || !credentials.tencent.SecretKey) {
    throw new Error(
      "Unable to run tests. Tencent credentials not found in the envionrment"
    );
  }

  return credentials;
};

const getYamlConfig = (filePath) => {
  try {
    const config = yaml.safeLoad(fs.readFileSync(filePath, "utf-8"));
    config.inputs.src.src = path.resolve(__dirname, "../src/");
    config.inputs.src.hook = "SKIP_PREFLIGHT_CHECK=true npm run build";
    config.inputs.src.dist = path.resolve(__dirname, "../src/dist/");

    return config;
  } catch (e) {
    throw new Error(`read ${filePath} config file error: ${e}`);
  }
};

module.exports = { generateId, getServerlessSdk, getCredentials , getYamlConfig };
