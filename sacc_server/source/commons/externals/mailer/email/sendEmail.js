require('dotenv');
const AWS = require('aws-sdk');
const logger = require("../../../logger/logger");
const sgMail = require('@sendgrid/mail');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

async function send(data, isHTML = false) {
  AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_SES_REGION,
    correctClockSkew: true,
  });

  const Body = isHTML ? { 
    Html: {
      Charset: 'UTF-8',
      Data: data.body,
    }
  } : {
    Text: {
      Charset: "UTF-8",
      Data: data.body
    }
  };

  const params = {
    Destination: {
      ToAddresses: [data.email],
    },
    Message: {
      Body,
      Subject: {
        Charset: 'UTF-8',
        Data: data.subject,
      },
    },
    Source: process.env.AWS_FROM,
    ReplyToAddresses: [
      process.env.AWS_REPLY,
    ],
  };

  return new AWS.SES({ apiVersion: process.env.AWS_API_VERSION }).sendEmail(params).promise();
}

async function sendInvitationEmail(msg) {
  try {

    const { email, templateName } = msg;
    let template = '../../../../views/templates/invitationEmailTemplate.html'
    if(templateName == 'apk') template = '../../../../views/templates/apkEmailTemplate.html'

    sgMail.setApiKey("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");

    try{

      const file = path.join(
        __dirname,
        template
      );

      const htmlContent = await fs.readFileSync(file, 'utf8');
      var data = ejs.render(htmlContent, { ...msg, ...msg.body });
      const mailMeta = {
        to: email,
        from: {
          name: "Dentist India Plus",
          email: "support@dentistindiaplus.com"
        },
        subject: "Greetings from Dentist India Plus",
        html: data
      }
      await sgMail.send(mailMeta);
    }catch(e){
      console.log(e.toString());
    }
} catch (err) {
    console.log(err)
    logger.error(err.message);
}
  }


module.exports = { send, sendInvitationEmail };