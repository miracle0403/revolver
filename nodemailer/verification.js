exports.verifymail = function verifymail(x){
	var nodemailer = require('nodemailer');
	var details  = require( '../routes/index.js' );
	var sname = details.sponsor;
	var username = details.username;
	var fullname  = details.fullname;
	var email  = details.email;
	var password = details.password;
	var code = details.code;
	var link = 'akahlineglobalservices.com/' + username + '/' + email + '/' + password + '/' + code;
	
	console.log( details);
	var hbs = require('nodemailer-express-handlebars');
	var transporter = nodemailer.createTransport({ 
		host: 'server206.web-hosting.com', 
		port: 26, 
		secure: false, // true for 465, false for other ports
		auth: { 
			user: 'noreply@swiftcircle.website', // generated ethereal 
			pass:  'Miracle1994' // generated ethereal password } }); 
		  }
    });
transporter.use('compile', hbs({ viewPath: '../views/', extName: '.hbs' })); 

//the message properties
	var mailOptions = {
  		from: 'noreply@swiftcircle.website',
  		to: x,
  		subject: 'Verify Your Email',
		template: 'emailverify',
  		context: {
  			sponsor: sname,
  			password: password,
  			code: code,
  			email: email,
  			fullname: fullname,
  			username: username,
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