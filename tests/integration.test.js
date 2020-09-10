const { getYamlConfig,  generateId, getServerlessSdk, getCredentials } = require('./utils')
const path = require('path')
const axios = require('axios')

// set enough timeout for deployment to finish
jest.setTimeout(600000)

// the yaml file we're testing against
const instanceYaml = getYamlConfig(path.resolve(__dirname, '../src/serverless.yml'))
// get aws credentials from env
const credentials = getCredentials()

const sdk = getServerlessSdk()

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
