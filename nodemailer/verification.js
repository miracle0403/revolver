exports.verifymail = function verifymail(user, x, code, password, sponsor, fullname, pin){
	var nodemailer = require('nodemailer');
	var link = 'localhost:1437/' + user + '/' + x + '/' + password + '/' + code + '/' + pin;
	
	//console.log( code);
	var hbs = require('nodemailer-express-handlebars');
	var transporter = nodemailer.createTransport({ 
		host: 'mail.privateemail.com', 
		port: 465, 
		secure: true, // true for 465, false for other ports
		auth: { 
			user: 'admin@swiftrevolver.com', // generated ethereal 
			pass:  '*Cw1Gw:ZdERt%' // generated ethereal password } }); 
		  }
    });
transporter.use('compile', hbs({ viewPath: './views/mail/', extName: '.hbs' })); 

//the message properties
	var mailOptions = {
  		from: 'admin@swiftrevolver.com',
  		to: x,
  		subject: 'Verify Your Email', 
		template: 'emailverify',
  		context: {
  			password: password,
  			fullname: fullname,
  			username: user,
  			link: link
  		}
	}
	
// send the mail
	transporter.sendMail(mailOptions, function(error, info) { 
		if (error) {
			return console.log(error); 
		} 
		console.log('Message sent: %s', info.messageId);
		//console.log(module.exports.email);
  	});
}