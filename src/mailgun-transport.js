'use strict';

var Mailgun = require('mailgun-js');
var packageData = require('../package.json');

module.exports = function (options) {
  return new MailgunTransport(options);
};

function MailgunTransport(options) {
  this.options = options || {};
  this.name = 'Mailgun';
  this.version = packageData.version;

  this.mailgun = Mailgun({
    apiKey: this.options.auth.api_key,
    domain: this.options.auth.domain || ''
  });
}


MailgunTransport.prototype.send = function send(mail, callback) {
  var mailData = mail.data;
  // convert nodemailer attachments to mailgun-js attachements
  if(mailData.attachments){
    var a, b, data, aa = [];
    for(var i in mailData.attachments){
      a = mailData.attachments[i];

      // mailgunjs does not encode content string to a buffer
      if (typeof a.content === 'string') {
        data = new Buffer(a.content, a.encoding);
      } else {
        data = a.content || a.path || undefined;
      }

      b = new this.mailgun.Attachment({
        data        : data,
        filename    : a.filename || undefined,
        contentType : a.contentType || undefined,
        knownLength : a.knownLength || undefined
      });

      aa.push(b);
    }
    mailData.attachment = aa;

  }
  
  var options = {
    type       : mailData.type,
    to         : mailData.to,
    from       : mailData.from,
    subject    : mailData.subject,
    text       : mailData.text,
    html       : mailData.html,
    attachment : mailData.attachment
  }
  
  if( mailData.bcc ){
    options.bcc = mailData.bcc
  }

  this.mailgun.messages().send(options, function (err, data) {
    callback(err || null, data);
  });

};

