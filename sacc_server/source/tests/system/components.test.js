require('dotenv').config();
const fetch = require('node-fetch');

test('Component | Hydra *OAuth', async () => {
  const OAuth = require('../../commons/auth/OAuth2');
  const token = await OAuth.getAccessToken('test_user');

  expect(token).toBeDefined();
  expect(token.access_token).toBeDefined();

  let hydraResponse = await fetch(process.env.HYDRA_OAUTH2_INTROSPECT_URL, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    body: `token=${token.access_token}`,
  });

  let responseObj = await hydraResponse.json();
  let { active: isActive, sub: userId } = responseObj;

  expect(isActive).toBeTruthy();
  expect(userId).toMatch('test_user');
});

test('Component | Database *MongoDB', async () => {
  const mongodbI = (await require('../../commons/models/mongo/runMongo'))();
  const { User } = require('../../commons/models/mongo/mongodb');
  const nUsers = await User.countDocuments({});

  (await mongodbI).connection.close();
  expect(nUsers).toBeGreaterThanOrEqual(0);
});

test('Component | Kafka', async () => {
  const { MessageQueue } = require('../../commons/externals/externalsManager');
  
  try { await MessageQueue.Kafka.publish('heartbeat', { value: 'hello-again' }) } catch (e) {}
  await (await MessageQueue.Kafka.subscribe('heartbeat', function({ message }) {
    expect(message.value.toString()).toMatch('hello-again')
  })).disconnect();
});

test('Component | Redis', async () => {
  const { Storage } = require('../../commons/externals/externalsManager');
  const redisClient = await Storage.disk.cache();

  await redisClient.set('gw-test', 'hello');

  const feedback = await redisClient.get('gw-test');

  expect(feedback).toMatch('hello');

  await redisClient.del('gw-test');

  const feedback2 = await redisClient.get('gw-test');

  expect(feedback2).toBeNull();

  await redisClient.quit();
});