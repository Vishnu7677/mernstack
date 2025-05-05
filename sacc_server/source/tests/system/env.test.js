require('dotenv').config();

test('.env | App Definition', async () => {
  expect(!!process.env.APP_NAME).toBeTruthy();
  expect(!!process.env.APP_SUPPORT_EMAIL).toBeTruthy();
});

test('.env | Server Definition', async () => {
  expect(!!process.env.SERVER_URL).toBeTruthy();
  expect(!!process.env.PORT).toBeTruthy();
  expect(!!process.env.PORT_ALT).toBeTruthy();
  expect(!!process.env.ENVIRONMENT).toBeTruthy();
});

test('.env | Resource Servers *Fallback-Only', async () => {
  expect(!!process.env.RS_NULL).toBeTruthy();
  expect(!!process.env.RS_SELF).toBeTruthy();
});

test('.env | CRYPT - Encryption', async () => {
  expect(!!process.env.DATA_ENCRYPTION_ALGORITHM).toBeTruthy();
  expect(!!process.env.DATA_ENCRYPTION_KEY).toBeTruthy();
  expect(!!process.env.DATA_ENCRYPTION_IV).toBeTruthy();
  expect(!!process.env.DATA_ENCRYPTION_IV_32).toBeTruthy();
});

test('.env | CRYPT - Hashing', async () => {
  expect(!!process.env.HASH_PEPPER).toBeTruthy();
  expect(!!process.env.HASH_SALT_ROUNDS).toBeTruthy();
  expect(!!process.env.HASH_ENTROPY).toBeTruthy();
});

test('.env | CRYPT - Public Key Encryption', async () => {
  expect(!!process.env.PKE_PASS_PHRASE).toBeTruthy();
  expect(!!process.env.PKE_PATH_TO_PUBLIC_KEY).toBeTruthy();
  expect(!!process.env.PKE_PATH_TO_PRIVATE_KEY).toBeTruthy();
});

test('.env | SSL Certificate References', async () => {
  expect(!!process.env.SSL_SERVER_KEY).toBeTruthy();
  expect(!!process.env.SSL_CERTIFICATE).toBeTruthy();
  expect(!!process.env.SSL_CERTIFICATE_AUTHORITY).toBeTruthy();
});

test('.env | OAuth - Hydra *Availability', async () => {
  expect(!!process.env.HYDRA_OAUTH2_CLIENT_ID).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_CLIENT_SECRET).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_SCOPE).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_STATE).toBeTruthy();
  expect(!!process.env.HYDRA_SERVER_URL).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_INTROSPECT_URL).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_AUTHORIZE_PATH).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_TOKEN_HOST).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_TOKEN_URL).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_REVOKE_URL).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_REFRESH_URL).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_REDIRECT_URI).toBeTruthy();  
  expect(!!process.env.HYDRA_OAUTH2_POST_LOGOUT_URL).toBeTruthy();
  expect(!!process.env.HYDRA_OAUTH2_ADMIN_URL).toBeTruthy();
});

test('.env | OAuth - Hydra *Value-Correctness', async () => {
  expect(process.env.HYDRA_OAUTH2_REDIRECT_URI).toMatch('http://localhost:8080/callback');  
  expect(process.env.HYDRA_OAUTH2_POST_LOGOUT_URL).toMatch('http://localhost:8080/post-logout-callback');
});

test('.env | SSO - Google', async () => {
  expect(!!process.env.GGL_CLIENT_ID).toBeTruthy();
  expect(!!process.env.GGL_SECRET).toBeTruthy();
  expect(!!process.env.GGL_ACCESS_TYPE).toBeTruthy();
  expect(!!process.env.GGL_CALLBACK_URL).toBeTruthy();
  expect(!!process.env.GGL_USER_INFO_URL).toBeTruthy();
});

test('.env | SSO - Facebook', async () => {
  expect(!!process.env.FB_CLIENT_ID).toBeTruthy();
  expect(!!process.env.FB_SECRET).toBeTruthy();
  expect(!!process.env.FB_CALLBACK_URL).toBeTruthy();
});

test('.env | SSO - Twitter', async () => {
  expect(!!process.env.TTR_CLIENT_ID).toBeTruthy();
  expect(!!process.env.TTR_CLIENT_SECRET).toBeTruthy();
  expect(!!process.env.TTR_CALLBACK_URL).toBeTruthy();
});

test('.env | Notifier - Email *Outbound', async () => {
  expect(!!process.env.AWS_KEY).toBeTruthy();
  expect(!!process.env.AWS_API_VERSION).toBeTruthy();
  expect(!!process.env.AWS_SECRET).toBeTruthy();
  expect(!!process.env.AWS_SES_REGION).toBeTruthy();
  expect(!!process.env.AWS_FROM).toBeTruthy();
  expect(!!process.env.AWS_REPLY).toBeTruthy();
});

test('.env | Notifier - SMS *Outbound', async () => {
  expect(!!process.env.TWOFACTOR_ACCESS_KEY).toBeTruthy();
  expect(!!process.env.TWOFACTOR_API_URL).toBeTruthy();
  expect(!!process.env.LOCAL_OTP_TEMPLATE).toBeTruthy();
  expect(!!process.env.LOCAL_OTP_VALIDITY).toBeTruthy();
  expect(!!process.env.LOCAL_OTP_SUBJECT).toBeTruthy();
  expect(!!process.env.LOCAL_OTP_CONTENT).toBeTruthy();
});

test('.env | Database - MongoDB', async () => {
  expect(!!process.env.MONGODB_URL).toBeTruthy();
});

test('.env | Logger', async () => {
  expect(!!process.env.LOG_LEVEL).toBeTruthy();
  expect(!!process.env.DATE_FORMAT).toBeTruthy();
  expect(!!process.env.FILE_API_LOG).toBeTruthy();
  expect(!!process.env.FILE_APP_LOG).toBeTruthy();
});

test('.env | Kafka', async () => {
  expect(!!process.env.KAFKA_CLIENT_ID).toBeTruthy();
  expect(!!process.env.KAFKA_BROKER).toBeTruthy();
  expect(!!process.env.KAFKA_MECHANISM).toBeTruthy();
  expect(!!process.env.KAFKA_GROUP_ID).toBeTruthy();
});

test('.env | Kafka *Static-Topics', async () => {
  expect(!!process.env.MQTOPIC_SOCKETCON_UPDATES).toBeTruthy();
  expect(!!process.env.MQTOPIC_CDP_STATISTICS).toBeTruthy();
  expect(!!process.env.MQTOPIC_USER_LOGGED_IN).toBeTruthy();

  if(!!!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
    expect(!!process.env.MQTOPIC_API_FAIL_ALERT).toBeTruthy();
  }
});

test('.env | Storage - Redis', async () => {
  expect(!!process.env.REDIS_HOST).toBeTruthy();
  expect(!!process.env.REDIS_PORT).toBeTruthy();
});

test('.env | Operational { CRON, API-Retry }', async () => {
  expect(!!process.env.CRON_LATE_NIGHT_N).toBeTruthy();
  expect(!!process.env.API_FAIL_DEFAULT_RETRY_COUNT).toBeTruthy();
});

test('.env | Offense Monitor', async () => {
  expect(!!process.env.OM_MAXIMUM_VIOLATIONS_PER_LEVEL).toBeTruthy();
  expect(!!process.env.OM_AUTO_ESCALATE_WHEN_REPEATED_NTIMES).toBeTruthy();
  expect(!!process.env.OM_ALLOW_DEVELOPER_POSTMAN_NTIMES_DAY).toBeTruthy();
  expect(!!process.env.OM_LO_OFF_SUSPENSION_DURATION_HOURS).toBeTruthy();
  expect(!!process.env.OM_MD_OFF_SUSPENSION_DURATION_HOURS).toBeTruthy();
  expect(!!process.env.OM_HI_OFF_SUSPENSION_DURATION_HOURS).toBeTruthy();
  expect(!!process.env.OM_PROTECTED_APIS_MIN_RECALL_GAP_SECS).toBeTruthy();
});