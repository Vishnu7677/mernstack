require('dotenv');
const fetch = require('node-fetch');
const axios=require('axios')
async function send(msg) {
//   const accessURL = process.env.TWOFACTOR_API_URL.replace('{{accessKey}}', process.env.TWOFACTOR_ACCESS_KEY);
//   const headers   = { 'Content-Type': 'application/x-www-form-urlencoded' };
//   const params    = {
//     To: msg.mobile,
//     From: msg.from || 'GRAYMA',
//     TemplateName: msg.template,
//     VAR1: msg.var1,
//     VAR2: msg.var2,
//     VAR3: msg.var3,
//   }
//   const data = Object.keys(params).reduce((acc, curr) => `${acc}${curr}=${(params[curr])}&`, '');
//   const { ResourceAPI } = require('../../externalsManager');
  


  console.log("545454545454")
    let apiKey = process.env.SMSPROVIDER_APIKEY
    let url= `https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=${apiKey}&MobileNo=${msg.to}&SenderID=DRTETH&Message=${msg.body}&ServiceName=TEMPLATE_BASED&DLTTemplateID=${msg.template}`
    // logger.info(url);
    let data=await axios(url)
  return data.data;
}

async function sendInvitationSMS(data) {
  const campaign_name = "testing"; 
const authKey =  process.env.SMSAUTHKEY; 
const sender = process.env.SMSSENDER;
const slogan = "Portal"
const message = `Hi Doctor, Welcome to ${slogan}. Now you can register in a flash! Your phone no. is ${data.to} & email id is ${data.email ? data.email : ''}. Your onboarding code is ${data.body.onboardingCode} & express code is ${data.body.expressCode}. Use link to register ${data.invitationUrl}. First Health!`; // Content approved from DLT
const route = "TR"; 
const template_id = process.env.INVITATION_TEMPLATE;
const scheduleTime = ""; 
const coding = "1"; 

const postData = {
    campaign_name: campaign_name,
    auth_key: authKey,
    receivers: data.to,
    sender: sender,
    route: route,
    message: {
        msgdata: message,
        Template_ID: template_id,
        coding: coding
    },
    scheduleTime: scheduleTime
};

await axios.post('http://sms.bulksmsserviceproviders.com/api/send/sms', postData, {
    headers: { 'Content-Type': 'application/json' }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.error('Error sending SMS:', error);
});
  
  }

  async function sendApkSMS(data) {

    const campaign_name = "testing"; 
  const authKey =  process.env.SMSAUTHKEY; 
  const sender = process.env.SMSSENDER;
  const slogan = "Portal"
  const message = `Hi Doctor. Welcome to ${slogan}. Personalized interaction with patients has never been so easy! Your username is ${data.body.userName} & password is ${data.body.password}. Use link to download your intuitive dashboard ${data.body.invitationUrl}. First Health!`; // Content approved from DLT
  const route = "TR"; 
  const template_id = process.env.APK_TEMPLATE;
  const scheduleTime = ""; 
  const coding = "1"; 
  
  const postData = {
      campaign_name: campaign_name,
      auth_key: authKey,
      receivers: data.to,
      sender: sender,
      route: route,
      message: {
          msgdata: message,
          Template_ID: template_id,
          coding: coding
      },
      scheduleTime: scheduleTime
  };
  
  await axios.post('http://sms.bulksmsserviceproviders.com/api/send/sms', postData, {
      headers: { 'Content-Type': 'application/json' }
  })
  .then(response => {
      console.log(response.data);
  })
  .catch(error => {
      console.error('Error sending SMS:', error);
  });
    
    }
module.exports = { send, sendInvitationSMS, sendApkSMS };