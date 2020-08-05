const { generateId, getServerlessSdk, getCredentials } = require('./utils')
const execSync = require('child_process').execSync
const path = require('path')
const axios = require('axios')

// set enough timeout for deployment to finish
jest.setTimeout(600000)

// the yaml file we're testing against
const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'website',
  name: `react-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    src: {
      src: path.resolve(__dirname, '../src/'),
      hook: 'npm run build',
      dist: path.resolve(__dirname, '../dist/'),
    },
    region: 'ap-guangzhou',
    runtime: 'Nodejs10.15',
    apigatewayConf: { environment: 'test' },
  },
  src: {
    src: path.resolve(__dirname, '../'),
  },
}

// get aws credentials from env
const credentials = getCredentials()

const sdk = getServerlessSdk(instanceYaml.org)
it('should successfully deploy react app', async () => {
  const instance = await sdk.deploy(instanceYaml, credentials)
  expect(instance).toBeDefined()
  expect(instance.instanceName).toEqual(instanceYaml.name)
  // get src from template by default
  expect(instance.outputs.website).toBeDefined()
  expect(instance.outputs.region).toEqual(instanceYaml.inputs.region)

  const response = await axios.get(instance.outputs.website)
  expect(
    RegExp('<title[^>]*>s*(?<Title>.*?)s*</title>', 'g').exec(response.data)[1],
  ).toEqual('Serverless Website and React')
})

it('should successfully remove react app', async () => {
  await sdk.remove(instanceYaml, credentials)
  result = await sdk.getInstance(
    instanceYaml.org,
    instanceYaml.stage,
    instanceYaml.app,
    instanceYaml.name,
  )
  expect(result.instance.instanceStatus).toEqual('inactive')
})
