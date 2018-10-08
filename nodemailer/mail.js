exports.sendmail= function sendmail(x, y, z){
	var nodemailer = require('nodemailer');
	//var mail = require( '../functions/mailfunctions.js' );
	
	//console.log( trysend );
	var hbs = require('nodemailer-express-handlebars');
	var transporter = nodemailer.createTransport({ 
		host: 'server1.akahlineglobalservices.com', 
		port: 587, 
		secure: false, // true for 465, false for other ports
		auth: { 
			user: 'admin@akahlineglobalservices.com', // generated ethereal 
			pass:  'Akahlineglobal' // generated ethereal password } }); 
		  }
    });
transporter.use('compile', hbs({ viewPath: './views/mail', extName: '.hbs' })); 

//the message properties
	var mailOptions = {
  		from: 'noreply@swiftcircle.website',
  		to: x,
  		subject: z,
		template: 'adminmail',
  		context: {
  			body: y
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