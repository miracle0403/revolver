'use strict';
const nodemailer = require('nodemailer'); 
//var resete = require('../nodemailer/passwordreset.js');
var matrix = require( '../functions/normal.js' ); 
var reset = require('../functions/mailfunctions.js');
var fillup = require('../functions/withsponsor.js');
var timer = require( '../functions/datefunctions.js' ); 
var express = require('express');
var passport = require('passport'); 
var securePin = require('secure-pin');
var charSet = new securePin.CharSet();
charSet.addLowerCaseAlpha().addUpperCaseAlpha().addNumeric().randomize();
var router = express.Router();
var mysql = require( 'mysql' );
var db = require('../db.js');
var expressValidator = require('express-validator'); 
var  matrix = require('../functions/normal.js');
 

var bcrypt = require('bcrypt-nodejs');
function rounds( err, results ){ 
	if ( err ) throw err;
}
const saltRounds = bcrypt.genSalt( 10, rounds);

var pool  = mysql.createPool({
  connectionLimit : 100,
  multipleStatements: true, 
  waitForConnections: true,
  host: "localhost",
  user: "root",
  //password: 'Akahlineglobal',
  database: "new"
});

//
//console.log( days )
//console.log( now )
//var admin = admin( );
//console.log( admin )
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  
 	res.render('index', { title: 'AKAHLINE GLOBAL SERVICES' });		

});

// get join
router.get('/howitworks',  function (req, res, next){

//console.log( req.route.path )
  res.render('howitworks', {title: "HOW IT WORKS"});
});

router.get('/faq',  function (req, res, next){
  res.render('faq', {title: "FAQ"});
});

// get password reset
router.get('/reset/:username/:email/:password/:code',  function (req, res, next){
  var username = req.params.username;
  var email = req.params.email;
  var password = req.params.password;
  var username = req.params.username;
  var code = req.params.code;
  //get username
    db.query('SELECT username FROM user WHERE username = ?', [username], function(err, results, fields){
      if (err) throw err;
      if (results.length === 0){
        res.render('nullreset', {title: 'Invalid link'});
		console.log('not a valid username');
	  }else{
		  db.query('SELECT email FROM user WHERE email = ?', [email], function(err, results, fields){
			if (err) throw err;
			if (results.length === 0){
				res.render('nullreset', {title: 'Invalid link'});
				console.log('not a valid username');
			}else{
				db.query('SELECT password FROM user WHERE password = ?', [password], function(err, results, fields){
					if (err) throw err;
					if (results.length === 0){
						res.render('nullreset', {title: 'Invalid link'});
					}else{
						db.query('SELECT code FROM reset WHERE status = ? AND user = ?', ['active', username], function(err, results, fields){
							if (err) throw err;
							if (results.length === 0){
								res.render('nullreset', {title: 'Invalid link'});
							}else{
							var hash = results[0].code;
								bcrypt.compare(code, hash, function(err, response){
								if (response === true){
									res.render('nullreset', {title: 'Invalid link'});
								}else {
									db.query( 'UPDATE reset SET status = ? WHERE user = ?',['expired', username], function ( err, results, fields ){
											if( err ) throw err;
											res.redirect( 'reset' );
											});
								}
								});
         
							}
						});
					}
				});
			}
		  });
	  }
	});
});
function restrict(x, y, res){
	var currentUser = x
	//the db query
	db.query( 'SELECT user FROM admin WHERE user  = ?', [currentUser], function ( err, results, fields ){ 
		if( err ) throw err;
		if( results.length === 0 ){
		console.log( 'user not an admin' )
			res.redirect( 'dashboard' )
		}
		else{
			var route = y;
			console.log( route )
			//res.redirect( route )
			//return currentUser;
		}
	});
}
function admini(x){
	db.query( 'SELECT user FROM admin WHERE user  = ?', [x], function ( err, results, fields ){ 
		if( err ) throw err;
		if( results.length === 0 ){
			console.log( 'not admin' );
		}
		else{
			var admin = x;
			return admin;
		}
	});
}
//var admin = admini( )
//var vtimer  = timer.timerreset( )
//setInterval( 10000, vtimer ); 
// get password verify

// get password reset
router.get('/passwordreset',  function (req, res, next){
  res.render('passwordreset', {title: "PASSWORD RESET"});
});
// get verification
router.get('/manage', authentificationMiddleware(), function (req, res, next){
	  var currentUser = req.session.passport.user.user_id;
	  db.query( 'SELECT user FROM admin WHERE user  = ?', [currentUser], function ( err, results, fields ){ 
			if( err ) throw err;
			if( results.length === 0 ){
				res.redirect( 'dashboard' )
			}
			else{
			var admin = currentUser;
				//check number of admins
				db.query( 'SELECT COUNT(*) AS amount FROM admin ', function ( err, results, fields ){ 
					if( err ) throw err;
					var amount = results[0].amount;
					//check amount of users
					db.query( 'SELECT COUNT(*) AS amount FROM user ', function ( err, results, fields ){ 
						if( err ) throw err;
						var number = results[0].amount;
						//check total earned
						db.query( 'SELECT SUM(feeder) AS feeder,  SUM(stage1) AS stage1, SUM(stage2) AS stage2, SUM(stage3) AS stage3, SUM(stage4) AS stage4, SUM(powerbank) AS powerbank, SUM(phone) AS phone, SUM(laptop) AS laptop, SUM(car) AS car, SUM(empower) AS empower, SUM(leadership) AS leadership, SUM(salary) AS salary FROM earnings', function ( err, results, fields){ 
						if( err ) throw err;
						var earnings = {
												feeder: results[0].feeder, 
												stage1: results[0].stage1,
												stage2: results[0].stage2,
												stage3: results[0].stage3,
												stage4: results[0].stage4,
												powerbank: results[0].powerbank,
												phone: results[0].phone,
												laptop: results[0].laptop,
												leadership: results[0].leadership,
												empower: results[0].empower,
												salary: results[0].salary,
												car: results[0].car
											}
											//console.log('the earnings')
											//console.log(results)
											var gift = earnings.salary + earnings.powerbank + earnings.phone + earnings.car + earnings.laptop + earnings.empower + earnings.leadership;
											var cash  = earnings.feeder + earnings.stage1 + earnings.stage2 + earnings.stage3 + earnings.stage4;
											var total = cash + gift;
											//check pending payments
											db.query( 'SELECT SUM( amount ) AS amount FROM withdraw WHERE status = ? ', ['pending'], function ( err, results, fields ){ 
													if( err ) throw err;
													var pnumber = results[0].amount;
													db.query( 'SELECT SUM( amount ) AS amount FROM withdraw WHERE status = ? ', ['paid'], function ( err, results, fields ){ 
													if( err ) throw err;
													var paidnumber = results[0].amount;
													//check paid
						res.render( 'manage', {title: 'MANAGE USERS', gift: gift, cash: cash, total: total, number: number, pending: pnumber, car: earnings.car, paid: paidnumber, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership,  laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2,  stage1: earnings.stage1, feeder: earnings.feeder, admin: admin, amount: amount});
								});
							});
						});
					});
				});
			}
 	});
});


// get terms and conditions
router.get('/terms', function (req, res, next) {
  res.render('terms', {title: "TERMS AND CONDITIONS"});
});

// get status
router.get('/status', function (req, res, next) {
  res.render('status');
});

//all users
router.get('/allusers', authentificationMiddleware(), function  (req, res, next) {
		var currentUser = req.session.passport.user.user_id;
		var route = req.route.path;
		restrict( currentUser, route, res )
	    db.query('SELECT * FROM user', function(err, results, fields){
    		 if (err) throw err;
    		 var user = results;
    		 db.query('SELECT * FROM admin', function(err, results, fields){
    		 	if (err) throw err;
    		 	var admin = results;
  				res.render('allusers', {title: 'ALL USERS', admin: admin, users: user});
  			});
  });
});

//all pending payments
router.get('/pending', authentificationMiddleware(), function  (req, res, next) {
		var currentUser = req.session.passport.user.user_id;
		var route = req.route.path;
		restrict( currentUser, route, res )
	    db.query('SELECT * FROM withdraw WHERE status = ?', ['pending'], function(err, results, fields){
    		 if (err) throw err;
    		 var pending = results;
    		 db.query('SELECT * FROM withdraw WHERE status = ?', ['paid'], function(err, results, fields){
    		 	if (err) throw err;
    		 	var paid = results;
    		 	var admin = 'for admin'
  				res.render('pending', {title: 'PAYMENTS', admin: admin, pending: pending, paid: paid});
  			});
  });
});

//get register with referral link
router.get('/register/:username', function(req, res, next) {
  const db = require('../db.js');
  var username = req.params.username;
    //get the sponsor name on the registration page
    db.query('SELECT username FROM user WHERE username = ?', [username],
    function(err, results, fields){
      if (err) throw err;
      if (results.length === 0){
        res.render('register', {title: 'REGISTRATION'});
        console.log('not a valid sponsor name');
       // req.flash( 'error', error.msg);
        res.render( '/register')
      }else{
        var sponsor = results[0].username;
        console.log(sponsor)
        if (sponsor){
          console.log(JSON.stringify(sponsor));
          res.render('register', { title: 'REGISTRATION', sponsor: sponsor });
        }     
      }
    });  
});

//register get request
router.get('/register', function(req, res, next) {
	
    res.render('register',  { title: 'REGISTRATION'});
});

//get login
router.get('/login', function(req, res, next) {
	const flashMessages = res.locals.getMessages( );
	if( flashMessages.error ){
		res.render( 'login', {
			showErrors: true,
			errors: flashMessages.error
		});
	}else{
		res.render( 'login' )
	}
	//console.log( 'flash', flashMessages);
  res.render('login', { title: 'LOG IN'});
});

//get referrals
router.get('/referrals', authentificationMiddleware(), function(req, res, next) {
  var currentUser = req.session.passport.user.user_id;
  var admin = admini( currentUser )
  //get sponsor name from database to profile page
  db.query('SELECT full_name, code, username, phone FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
    if (err) throw err;
    if( results.length === 0 ){
		
    	db.query('SELECT sponsor FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
    if (err) throw err;
    var sponsor = results[0].sponsor;
    db.query('SELECT username FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
      if (err) throw err;
      //get the referral link to home page
      //var website = "localhost:3002/";
      var user = results[0].username;
      var reg = "/register/";
      var link = user;
      var register = reg + user;
      db.query('SELECT * FROM user WHERE sponsor = ?', [user], function(err, results, fields){
        if (err) throw err;
        //console.log(results)
        res.render('referrals', { title: 'Referrals', admin: admin, register: register, referrals: results, sponsor: sponsor, link: link});
      });
    });
  });
    }else{
    	var admin = currentUser;
    	db.query('SELECT sponsor FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
    if (err) throw err;
    var sponsor = results[0].sponsor;
    db.query('SELECT username FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
      if (err) throw err;
      //get the referral link to home page
      //var website = "localhost:3002/";
      var user = results[0].username;
      var reg = "/register/";
      var link = user;
      var register = reg + user;
      db.query('SELECT * FROM user WHERE sponsor = ?', [user], function(err, results, fields){
        if (err) throw err;
        //console.log(results)
        res.render('referrals', { title: 'Referrals', admin: admin, register: register, referrals: results, sponsor: sponsor, admin: admin, link: link});
      });
    });
  });
    }
  });
});
 

//get logout
router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//get dashboard''
router.get('/dashboard', authentificationMiddleware(), function(req, res, next) {
	pinset( );
  var db = require('../db.js');
  var currentUser = req.session.passport.user.user_id;
  admini( currentUser )
  db.query( 'SELECT username FROM user WHERE user_id = ?', [currentUser], function ( err, results, fields ){
  	if( err ) throw err;
  	var username = results[0].username; 
 	//check if the user has updated his profile
	db.query( 'SELECT user FROM profile WHERE user = ?', [username], function ( err, results, fields ){
		if( err ) throw err;
  		if( results.length === 0 ){
  			var error = 'Please update your profile to see your stats.';
  			res.render( 'dashboard', {title: 'DASHBOARD', error: error});
  		}
		else{
		//check the transaction
		db.query( 'SELECT balance FROM transactions WHERE user = ?', [username], function ( err, results, fields ){
				if( err ) throw err;
				if (results.length === 0){
					var balance = 0;
							db.query( 'SELECT feeder, stage1, stage2, stage3, stage4 FROM user_tree WHERE user = ?', [username], function ( err, results, fields ){
				if( err ) throw err;
				var stage = {
  				feeder: results[0].feeder,
  				stage1: results[0].stage1,
  				stage2: results[0].stage2,
  				stage3: results[0].stage3,
  				stage4: results[0].stage4
				}
			//	console.log(stage);
				db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM feeder AS node, feeder AS parent, feeder AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM feeder AS node, feeder AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth = ? ORDER BY depth ', [username, 1], function(err, results, fields){
					if (err) throw err;
					//console.log('result is' + feeder)
					var feeder = results;
					//console.log(feeder );
					db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage1 AS node, stage1 AS parent, stage1 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage1 AS node, stage1 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth  < ? ORDER BY depth', [username, 3], function(err, results, fields){
						if (err) throw err; 
						var stage1 = results;
						//console.log( stage1 );
						db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage2 AS node, stage2 AS parent, stage2 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage2 AS node, stage2 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth   = ? ORDER BY depth', [username, 4], function(err, results, fields){
							if (err) throw err; 
							var stage2 = results;
							db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage3 AS node, stage3 AS parent, stage3 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage3 AS node, stage3 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth   =  ? ORDER BY depth', [username, 1], function(err, results, fields){
								if (err) throw err; 
								var stage3 = results;
								db.query('SELECT node.user,   (COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage4 AS node, stage4 AS parent, stage4 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage4 AS node, stage4 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth   =  ? ORDER BY depth', [username, 1], function(err, results, fields){
									if (err) throw err; 
									var stage4 = results;
									db.query( 'SELECT user FROM admin WHERE user = ?', [currentUser], function ( err, results, fields ){
										if(err) throw err;
										if( results.length ===0 ){
										db.query( 'SELECT * FROM earnings WHERE user = ?', [username], function ( err, results, fields ){
										if(err) throw err;
										if( results.length === 0 && stage.feeder !== null  && stage.stage1 === null ){
											var earnings = {
												feeder: 0,
												stage1: 0,
												stage2: 0,
												stage3: 0,
												stage4: 0,
												powerbank: 0,
												phone: 0,
												laptop: 0,
												leadership: 0,
												empower: 0,
												salary: 0,
												car: 0
											}
											var cash = 0;
											var gift = 0;
											var total = cash + gift;
											var error = 'You have not earned yet.'
											var currentstage = 'Feeder Stage';
											res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, error: error,  stage1tree: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, balance: balance, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										}else{
											
											var earnings = {
												feeder: results[0].feeder, 
												stage1: results[0].stage1,
												stage2: results[0].stage2,
												stage3: results[0].stage3,
												stage4: results[0].stage4,
												powerbank: results[0].powerbank,
												phone: results[0].phone,
												laptop: results[0].laptop,
												leadership: results[0].leadership,
												empower: results[0].empower,
												salary: results[0].salary,
												car: results[0].car
											}
											//console.log('the earnings')
											//console.log(results)
											var gift = earnings.salary + earnings.powerbank + earnings.phone + earnings.car + earnings.laptop + earnings.empower + earnings.leadership;
											var cash  = earnings.feeder + earnings.stage1 + earnings.stage2 + earnings.stage3 + earnings.stage4;
											var total = cash + gift;
											if( stage.feeder !== null  && stage.stage1 === null){
												var currentstage = 'Feeder Stage';
												console.log(currentstage); 
												res.render( 'dashboard', {title: 'USER DASHBOARD', balance: balance, feedertree: feeder, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
												if( stage.stage1 !== null  && stage.stage2 === null){
													var currentstage = ' Stage One';
													console.log(currentstage);
													res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, balance: balance, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, balance: balance, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										
	}												if( stage.stage2 !==  null && stage.stage3 === null){
														var currentstage = ' Stage Two';
														console.log(currentstage);
														res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
}										
														if( stage.stage3 !== null  && stage.stage4 === null){
															var currentstage = ' Stage Three';
															res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
		}								
															//console.log(currentstage);
															if( stage.stage4 !== null){
																var currentstage = ' Stage Four';
																console.log(currentstage);
																res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
																
															
										}
									});
										
										}
										else{
											var admin = currentUser;
											db.query( 'SELECT * FROM earnings WHERE user = ?', [username], function ( err, results, fields ){
										if(err) throw err;
										if( results.length === 0 && stage.feeder !== null  && stage.stage1 === null ){
											var earnings = {
												feeder: 0,
												stage1: 0,
												stage2: 0,
												stage3: 0,
												stage4: 0,
												powerbank: 0,
												phone: 0,
												laptop: 0,
												leadership: 0,
												empower: 0,
												salary: 0,
												car: 0
											}
											var cash = 0;
											var gift = 0;
											var total = cash + gift;
											var error = 'You have not earned yet.'
											var currentstage = 'Feeder Stage';
											res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, error: error,  stage1tree: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, balance: balance, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, admin: admin, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										}else{
											
											var earnings = {
												feeder: results[0].feeder, 
												stage1: results[0].stage1,
												stage2: results[0].stage2,
												stage3: results[0].stage3,
												stage4: results[0].stage4,
												powerbank: results[0].powerbank,
												phone: results[0].phone,
												laptop: results[0].laptop,
												leadership: results[0].leadership,
												empower: results[0].empower,
												salary: results[0].salary,
												car: results[0].car
											}
											//console.log('the earnings')
											//console.log(results)
											var gift = earnings.salary + earnings.powerbank + earnings.phone + earnings.car + earnings.laptop + earnings.empower + earnings.leadership;
											var cash  = earnings.feeder + earnings.stage1 + earnings.stage2 + earnings.stage3 + earnings.stage4;
											var total = cash + gift;
											if( stage.feeder !== null  && stage.stage1 === null){
												var currentstage = 'Feeder Stage';
												console.log(currentstage); 
												res.render( 'dashboard', {title: 'USER DASHBOARD', balance: balance, admin: admin, feedertree: feeder, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
												if( stage.stage1 !== null  && stage.stage2 === null){
													var currentstage = ' Stage One';
													console.log(currentstage);
													res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, balance: balance, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, admin: admin, balance: balance, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										
	}												if( stage.stage2 !==  null && stage.stage3 === null){
														var currentstage = ' Stage Two';
														console.log(currentstage);
														res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, admin: admin, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
}										
														if( stage.stage3 !== null  && stage.stage4 === null){
															var currentstage = ' Stage Three';
															res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, admin: admin, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
		}								
															//console.log(currentstage);
															if( stage.stage4 !== null){
																var currentstage = ' Stage Four';
																console.log(currentstage);
																res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, admin: admin, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
																
															
										} 
									}); 
										}
									});
								});
							});
						});
					});
				});
			
			});
				}else{
				var last = results.slice( -1 )[0];
				var balance = last.balance;
			//	console.log( balance )
			db.query( 'SELECT feeder, stage1, stage2, stage3, stage4 FROM user_tree WHERE user = ?', [username], function ( err, results, fields ){
				if( err ) throw err;
				var stage = {
  				feeder: results[0].feeder,
  				stage1: results[0].stage1,
  				stage2: results[0].stage2,
  				stage3: results[0].stage3,
  				stage4: results[0].stage4
				}
			//	console.log(stage);
				db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM feeder AS node, feeder AS parent, feeder AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM feeder AS node, feeder AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth = ? ORDER BY depth ', [username, 1], function(err, results, fields){
					if (err) throw err;
					//console.log('result is' + feeder)
					var feeder = results;
					//console.log(feeder );
					db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage1 AS node, stage1 AS parent, stage1 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage1 AS node, stage1 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth  < ? ORDER BY depth', [username, 3], function(err, results, fields){
						if (err) throw err; 
						var stage1 = results;
						//console.log( stage1 );
						db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage2 AS node, stage2 AS parent, stage2 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage2 AS node, stage2 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth   = ? ORDER BY depth', [username, 4], function(err, results, fields){
							if (err) throw err; 
							var stage2 = results;
							db.query('SELECT node.user,(COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage3 AS node, stage3 AS parent, stage3 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage3 AS node, stage3 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth   =  ? ORDER BY depth', [username, 1], function(err, results, fields){
								if (err) throw err; 
								var stage3 = results;
								db.query('SELECT node.user,   (COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM stage4 AS node, stage4 AS parent, stage4 AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM stage4 AS node, stage4 AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user  =  sub_tree.user GROUP BY node.user HAVING depth   =  ? ORDER BY depth', [username, 1], function(err, results, fields){
									if (err) throw err; 
									var stage4 = results;
									db.query( 'SELECT user FROM admin WHERE user = ?', [currentUser], function ( err, results, fields ){
										if(err) throw err;
										if( results.length ===0 ){
										db.query( 'SELECT * FROM earnings WHERE user = ?', [username], function ( err, results, fields ){
										if(err) throw err;
										if( results.length === 0 && stage.feeder !== null  && stage.stage1 === null ){
											var earnings = {
												feeder: 0,
												stage1: 0,
												stage2: 0,
												stage3: 0,
												stage4: 0,
												powerbank: 0,
												phone: 0,
												laptop: 0,
												leadership: 0,
												empower: 0,
												salary: 0,
												car: 0
											}
											var cash = 0;
											var gift = 0;
											var total = cash + gift;
											var error = 'You have not earned yet.'
											var currentstage = 'Feeder Stage';
											res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, error: error,  stage1tree: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, balance: balance, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										}else{
											
											var earnings = {
												feeder: results[0].feeder, 
												stage1: results[0].stage1,
												stage2: results[0].stage2,
												stage3: results[0].stage3,
												stage4: results[0].stage4,
												powerbank: results[0].powerbank,
												phone: results[0].phone,
												laptop: results[0].laptop,
												leadership: results[0].leadership,
												empower: results[0].empower,
												salary: results[0].salary,
												car: results[0].car
											}
											//console.log('the earnings')
											//console.log(results)
											var gift = earnings.salary + earnings.powerbank + earnings.phone + earnings.car + earnings.laptop + earnings.empower + earnings.leadership;
											var cash  = earnings.feeder + earnings.stage1 + earnings.stage2 + earnings.stage3 + earnings.stage4;
											var total = cash + gift;
											if( stage.feeder !== null  && stage.stage1 === null){
												var currentstage = 'Feeder Stage';
												console.log(currentstage); 
												res.render( 'dashboard', {title: 'USER DASHBOARD', balance: balance, feedertree: feeder, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
												if( stage.stage1 !== null  && stage.stage2 === null){
													var currentstage = ' Stage One';
													console.log(currentstage);
													res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, balance: balance, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, balance: balance, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										
	}												if( stage.stage2 !==  null && stage.stage3 === null){
														var currentstage = ' Stage Two';
														console.log(currentstage);
														res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
}										
														if( stage.stage3 !== null  && stage.stage4 === null){
															var currentstage = ' Stage Three';
															res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
		}								
															//console.log(currentstage);
															if( stage.stage4 !== null){
																var currentstage = ' Stage Four';
																console.log(currentstage);
																res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
																
															
										}
									});
										
										}
										else{
											var admin = currentUser;
											db.query( 'SELECT * FROM earnings WHERE user = ?', [username], function ( err, results, fields ){
										if(err) throw err;
										if( results.length === 0 && stage.feeder !== null  && stage.stage1 === null ){
											var earnings = {
												feeder: 0,
												stage1: 0,
												stage2: 0,
												stage3: 0,
												stage4: 0,
												powerbank: 0,
												phone: 0,
												laptop: 0,
												leadership: 0,
												empower: 0,
												salary: 0,
												car: 0
											}
											var cash = 0;
											var gift = 0;
											var total = cash + gift;
											var error = 'You have not earned yet.'
											var currentstage = 'Feeder Stage';
											res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, error: error,  stage1tree: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, balance: balance, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, admin: admin, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										}else{
											
											var earnings = {
												feeder: results[0].feeder, 
												stage1: results[0].stage1,
												stage2: results[0].stage2,
												stage3: results[0].stage3,
												stage4: results[0].stage4,
												powerbank: results[0].powerbank,
												phone: results[0].phone,
												laptop: results[0].laptop,
												leadership: results[0].leadership,
												empower: results[0].empower,
												salary: results[0].salary,
												car: results[0].car
											}
											//console.log('the earnings')
											//console.log(results)
											var gift = earnings.salary + earnings.powerbank + earnings.phone + earnings.car + earnings.laptop + earnings.empower + earnings.leadership;
											var cash  = earnings.feeder + earnings.stage1 + earnings.stage2 + earnings.stage3 + earnings.stage4;
											var total = cash + gift;
											if( stage.feeder !== null  && stage.stage1 === null){
												var currentstage = 'Feeder Stage';
												console.log(currentstage); 
												res.render( 'dashboard', {title: 'USER DASHBOARD', balance: balance, admin: admin, feedertree: feeder, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
												if( stage.stage1 !== null  && stage.stage2 === null){
													var currentstage = ' Stage One';
													console.log(currentstage);
													res.render( 'dashboard', {title: 'USER DASHBOARD', feedertree: feeder, balance: balance, stage1tree: stage1, stage2tree: stage2, stage3tree: stage3, stage4tree: stage4, gift: gift, total: total, cash: cash, car: earnings.car, salary: earnings.salary, empower: earnings.empower, admin: admin, balance: balance, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
										
	}												if( stage.stage2 !==  null && stage.stage3 === null){
														var currentstage = ' Stage Two';
														console.log(currentstage);
														res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, admin: admin, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
}										
														if( stage.stage3 !== null  && stage.stage4 === null){
															var currentstage = ' Stage Three';
															res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, admin: admin, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
		}								
															//console.log(currentstage);
															if( stage.stage4 !== null){
																var currentstage = ' Stage Four';
																console.log(currentstage);
																res.render( 'dashboard', {title: 'USER DASHBOARD', feeder: feeder, stage1: stage1, stage2: stage2, stage3: stage3, stage4: stage4, gift: gift, total: total, cash: cash, car: earnings.car, admin: admin, balance: balance, salary: earnings.salary, empower: earnings.empower, leadership: earnings.leadership, laptop: earnings.laptop, phone: earnings.phone, powerbank: earnings.powerbank, stage4: earnings.stage4, stage3: earnings.stage3, stage2: earnings.stage2, stage: currentstage,  stage1: earnings.stage1, feeder: earnings.feeder });		
	}									
																
															
										}
									});
										}
									});
								});
							});
						});
					});
				});
			
			});
			}
		  }); 
		}
	});
  });
});

router.post('/sendmail',  function (req, res, next){
	var mail = req.body.mail;
	var subject = req.body.subject;
	var sendma = require( '../nodemailer/mail.js' ); 
	db.query( 'SELECT email FROM user', function ( err, results, fields ){
		if(err) throw err
		//var users = results;
		//loop to get the emails
		var i = 0;
		while(i < results.length){
		var email = results[i].email;
			sendma.sendmail( email, mail, subject);
			var info = 'Message Sent to ';
			var success = info + email;
		i++;
		res.render( 'status', {success: success});
		}
	});
});
//delete admin
router.post('/deladmin', function (req, res, next) {
	var user = req.body.user;
	db.query('SELECT user_id, username FROM user WHERE user_id = ?', [user], function(err, results, fields){
		if( err ) throw err;
		if ( results.length === 0){
			var error = 'Sorry this user does not exist.';
			res.render('status', {error: error });
		}
		else{
			db.query('SELECT user FROM admin WHERE user = ?', [user], function(err, results, fields){
				if( err ) throw err;
				if( results.length === 0 ){
					var error = 'Sorry this admin does not exist.'
				}
				else {
					db.query('DELETE FROM admin WHERE user = ?', [user], function(err, results, fields){
						if( err ) throw err;
						var success = 'Admin deleted successfully!'
						res.render('status', {success: success });
					});
				}
			});
		}
	});
});
//add new admin
router.post('/addadmin', function (req, res, next) {
	var user = req.body.user;
	db.query('SELECT user_id, username FROM user WHERE user_id = ?', [user], function(err, results, fields){
		if( err ) throw err;
		if ( results.length === 0){
			var error = 'Sorry this user does not exist.';
			res.render('status', {error: error });
		}
		else{
			db.query('SELECT user FROM admin WHERE user = ?', [user], function(err, results, fields){
				if( err ) throw err;
				if( results.length === 0 ){
					db.query('INSERT INTO admin ( user ) values( ? )', [user], function(err, results, fields){
						if( err ) throw err;
						var success = 'New Admin Added Successfully!';
						res.render('status', {success: success });
					});
				}
				if( results.length > 0 ){
					var error = 'This user is already an Admin';
					res.render('status', {error: error });
				} 
			});
		}
	});
});
//get profile
router.get('/profile', authentificationMiddleware(), function(req, res, next) {
  var currentUser = req.session.passport.user.user_id;
  
 db.query('SELECT user FROM admin WHERE user = ?', [currentUser], function(err, results, fields){
    if (err) throw err;
    if( results.length === 0 ){
    	db.query('SELECT full_name, code, username, phone FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
    if (err) throw err;
    //console.log(results)
    var bio = {
   	 	fullname: results[0].full_name,
    	code: results[0].code,
    	phone: results[0].phone,
    	username: results[0].username
    }
    //get from profile table
    db.query('SELECT * FROM profile WHERE user = ?', [bio.username], function(err, results, fields){
      if (err) throw err;
      //console.log(results)
      if ( results.length === 0 ){
      		var error = "You have not updated your profile yet."
      		res.render('profile', {title: 'PROFILE', error: error,  phone: bio.phone, code: bio.code, fullname: bio.fullname});
      }else{
      		var prof = {
      		bank: results[0].bank,
      		bank: results[0].account_name,
      		bankname: results[0].account_name,
      		account_number: results[0].account_number
      }
      res.render('profile', {title: 'PROFILE', bank: prof.bank, accountname: prof.account_name, accountnumber: prof.account_number, phone: bio.phone, code: bio.code, fullname: bio.fullname});
      }
    });
  });
    }else{
    	var admin = currentUser;
    	db.query('SELECT full_name, code, username, phone FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
    if (err) throw err;
    //console.log(results)
    var bio = {
   	 	fullname: results[0].full_name,
    	code: results[0].code,
    	phone: results[0].phone,
    	username: results[0].username
    }
    //get from profile table
    db.query('SELECT * FROM profile WHERE user = ?', [bio.username], function(err, results, fields){
      if (err) throw err;
      //console.log(results)
      if ( results.length === 0 ){
      		var error = "You have not updated your profile yet."
      		res.render('profile', {title: 'PROFILE', error: error,  phone: bio.phone, code: bio.code, fullname: bio.fullname});
      }else{
      		var prof = {
      		bank: results[0].bank,
      		bank: results[0].account_name,
      		bankname: results[0].account_name,
      		account_number: results[0].account_number
      }
      res.render('profile', {title: 'PROFILE', bank: prof.bank, accountname: prof.account_name, accountnumber: prof.account_number, phone: bio.phone, admin: admin, code: bio.code, fullname: bio.fullname});
      }
    });
  });
    }
  //get user details to showcase
  });
});

// post password reset
router.post('/passwordreset',  function (req, res, next){
req.checkBody('username', 'Username must be between 8 to 25 characters').len(8,25);
req.checkBody('email', 'Invalid Email').isEmail();
req.checkBody('email', 'Email must be between 8 to 105 characters').len(8,105);
var errors = req.validationErrors();

  if (errors) { 
    console.log(JSON.stringify(errors));
  res.render('reset', {title: "RESET PASSWORD FAILED", error: errors});
  }else{
  	var username = req.body.username;
  	var email = req.body.email;
  }
  pool.getConnection( function( err, con ){
  if ( err ) throw err;
  	con.query( 'SELECT username, email FROM user WHERE username = ? AND email = ?', [username, email], function ( err, results, fields ){
  		if( err ) throw err;
  		if( results.length === 0 ){
  			var error  = 'Sorry, We could not find your account';
  			res.render('passwordreset', {title: "RESET PASSWORD FAILED", errors: error});
  		}else{
  			var username = results[0].username;
  			var email = results[0].email;
  			var success = 'Great! We found your account! Check your mail for a confirmation mail. If you do not find it in your inbox, check your spam.'
  			//function to send mail here
  			reset.sendreset( username, email );
  			res.render('passwordreset', {title: "RESET PASSWORD", errors: success});
  		}
 	 })
  });
});


//Passport login
passport.serializeUser(function(user_id, done){
  done(null, user_id)
});
        
passport.deserializeUser(function(user_id, done){
  done(null, user_id)
});

//pinset( )
//get function for pin and serial number
function pinset(){
var maiyl = require( '../nodemailer/pin.js' );
  var charSet = new securePin.CharSet(); 
  charSet.addLowerCaseAlpha().addUpperCaseAlpha().addNumeric().randomize();
  securePin.generatePin(10, function(pin){
    console.log("Pin: AGS"+ pin);
    securePin.generateString(10, charSet, function(str){
      console.log(str);
	  var pinn = 'AGS' + pin;
	  exports.pinn = pinn;
     bcrypt.hash(pinn, saltRounds, null, function(err, hash){
        pool.query('INSERT INTO pin (pin, serial) VALUES (?, ?)', [hash, str], function(error, results, fields){
          if (error) throw error;
          exports.str = str;
          //console.log(results)
          //the function to send mail
         //var mail =   'Sageabraham4@gmail.com';
         var mail = 'mify1@yahoo.com';
         maiyl.sendpin( mail,pinn, str ); 
        });
      });
    });
  });
}
pinset(  )
//authentication middleware snippet 
function authentificationMiddleware(){
  return (req, res, next) => {
    console.log(JSON.stringify(req.session.passport));
  if (req.isAuthenticated()) return next();

  res.redirect('/login'); 
  } 
}
/*function admin( req ){
	var currentUser = req.session.passport.user.user_id;
	//check if the user is in the admin section.
	db.query('SELECT user FROM admin WHERE user = ?', [currentUser], function(err, results, fields){
		if( err ) throw err;
		if( results.length === 0 ){
			console.log( 'not an admin' );
		}
		else{
			var adm = results[0].user;
			return adm
		}
	});
}
var admin = admin(  );*/ 
//post withdraw
router.post('/withdraw',  function (req, res, next){
	var currentUser = req.session.passport.user.user_id;
	//use the user username
	db.query('SELECT username FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
		if( err ) throw err;
		var username = results[0].username;
	//check if the user has transactions.
		db.query('SELECT balance FROM transactions WHERE user = ?', [username], function(err, results, fields){
   		   if (err) throw err;
   		   //console.log( results );
   		   if (results.length ===0){
   		   		var error = 'Insufficient funds';
   		   		res.render( 'status', {error: error});
   		   }else{
   		   		//check where there is no debit but loop first.
   		  	 	var i = 0;
   		  	 	var last =  results.slice( -1 )[0];
   		  	 	var balance = last.balance;
   		  	 	if( balance === 0 ){
   		  	 		var error = 'insufficient funds';
   		  	 		res.render( 'status', {error: error});
   		  	 	}else{
   		  	 	//call the withdraw funds.
   		  	 		db.query( 'CALL debit(?,?)', [username, balance], function ( err, results, fields ){
   		  	 			 var success = 'Withdraw Successful!'
   		   				if( err ) throw err;
   		   				res.render( 'status', {success: success});
   		   			});
   		  	 	}
   		   }
  		});
  	});
});
router.post('/pay', function (req, res, next) {
  var user = req.body.user;
  var id = req.body.id;
  //check if the user has pending payments
  db.query('SELECT * FROM withdraw WHERE user = ? and status = ?', [user, 'pending'], function(err, results, fields){
		if ( err ) throw err;
		if( results.length === 0 ){
			var error = 'Sorry, this user do not have pending payments. Search this user transaction history and check the pending payments for more information';
			res.render( 'status', {error: error});
		}
		else{
			//update to paid
			db.query('UPDATE withdraw SET status = ? WHERE user = ?', ['paid', user], function(error, results, fields){
        	  if (error) throw error;
        	  db.query('UPDATE transactions SET debit_receipt = ? WHERE user = ?', [id, user], function(error, results, fields){
        	  if (error) throw error;
        	  var success = 'Payment recorded'
          res.render( 'status', {success: success});
          	});
          });
		}
	});
});

router.post('/reset', function(req, res, next) {
	var password = req.body.password;
	bcrypt.hash(password, saltRounds, null, function(err, hash){
        db.query('UPDATE user SET password = ? WHERE username = ?', [hash, username], function(error, results, fields){
          if (error) throw error;
          var success = 'Password changed successfully!';
          res.render( 'status',{success: success} ); 
        });
    });
});

router.post('/search', authentificationMiddleware(), function  (req, res, next) {
		var currentUser = req.session.passport.user.user_id;
		var route = req.route.path;
		restrict( currentUser, route, res )
	var username = req.body.username;
	db.query('SELECT * FROM user WHERE username = ?', [username], function(err, results, fields){
		if ( err ) throw err;
		if( results.length === 0 ){
			var error = 'invalid user';
			res.render( 'status', {error: error});
		}
		else{
			db.query('SELECT * FROM transactions WHERE user = ?', [username], function(err, results, fields){
				if ( err ) throw err;
				if( results.length === 0 ){
					var error  = 'This user has not earned yet.';
					res.render( 'status', {error: error});
				}else{
					var user = results;
					res.render( 'test', {user: user});
				}
			});
		}
	});
});


/*router.post('/debit', function(req, res, next) {
	var username =  req.body.username;
	var amount = req.body.amount;
	var funds = req.body.funds;
	db.query('SELECT username FROM users WHERE user = ?', [username], function(err, results, fields){
		if ( err ) throw err;
		if( results.length === 0 ){
			var error = 'User does not extist.';
			res.render('manage',  { title: 'Manage Users', error: error,  transactions: results});
		}else{
			//check his available balance
			db.query('SELECT * FROM transactions WHERE user = ?', [username], function(err, results, fields){
			if ( err ) throw err;
				if( results.length === 0 ){
					var error = 'insufficient funds';
					res.render('manage',  { title: 'Manage Users', error: error,  transactions: results});
				}
				else{
					//check if he has up to that amount
					var last = results.slice( -1 )[0];
					var bal = last.balance;
					if ( bal < amount ){
						var error = 'insufficient funds';
							res.render('manage',  { title: 'Manage Users', error: error,  transactions: results});
					}
					else{
						db.query( 'CALL debit( ? )' , [username], function ( err, results, fields ){
							if( err ) throw err;
							var success = 'success';
							res.render('manage',  { title: 'Manage Users', success: success,  transactions: results});
						});
					}
				}
			});
		}
	res.render('manage',  { title: 'Manage Users', transactions: results});
	});
});*/


//post log in
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/dashboard',
  failureFlash: true
}));

//post profile
router.post('/profile', function(req, res, next) {
  console.log(req.body) 
  req.checkBody('fullname', 'Full Name must be between 8 to 25 characters').len(8,25);
  //req.checkBody('email', 'Email must be between 8 to 25 characters').len(8,25);
 // req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('code', 'Country code must not be empty.').notEmpty();
  req.checkBody('account_number', 'Account Number must not be empty.').notEmpty();
  req.checkBody('phone', 'Phone Number must be ten characters').len(10);
  //req.checkBody('pass1', 'Password must have upper case, lower case, symbol, and number').matches(/^(?=,*\d)(?=, *[a-z])(?=, *[A-Z])(?!, [^a-zA-Z0-9]).{8,}$/, "i")
 
  var errors = req.validationErrors();

  if (errors) { 
    console.log(JSON.stringify(errors));
    res.render('profile', { title: 'UPDATE FAILED', errors: errors});

  }
  else {
    var password = req.body.password;
    //var email = req.body.email;
    var fullname = req.body.fullname;
    var code = req.body.code;
    var phone = req.body.phone;
    var bank = req.body.bank;
    var accountName = req.body.AccountName;
    var accountNumber = req.body.account_number;
    var currentUser = req.session.passport.user.user_id;

    //get sponsor name from database to profile page
    pool.query('SELECT password, username FROM user WHERE user_id = ?', [currentUser], function(err, results, fields){
      if (err) throw err;
      const hash = results[0].password;
      var username = results[0].username;
      //compare password
      bcrypt.compare(password, hash, function(err, response){
        if(response === false){
        var error = "Password is not correct";
          res.render('profile', { title: 'Profile Update failed', errors: error});
        }else{
              //update user
              pool.query('UPDATE user SET full_name = ?, code = ?, phone = ? WHERE user_id = ?', [fullname, code, phone, currentUser], function(err, results,fields){
                if (err) throw err;

                //check if user has updated profile before now
                pool.query('SELECT user FROM profile WHERE user = ?', [username], function(err, results, fields){
                  if (err) throw err;
      
                  if (results.length===0){
                    pool.query('INSERT INTO profile (user, bank, account_name, account_number) VALUES (?, ?, ?, ?)', [username, bank, accountName, accountNumber], function(error, result, fields){
                      if (error) throw error;
                      console.log(results);
                      res.render('profile', {title: "UPDATE SUCCESSFUL"});  
                    });
                  }else{
                    pool.query('UPDATE profile SET bank = ?, account_name = ?, account_number = ? WHERE user = ?', [bank, accountName, accountNumber, username], function(err, results,fields){
                      if (err) throw err;
                      var success = "Profile Updated";
                      console.log(results);
                      res.render('profile', {title: "UPDATE SUCCESSFUL", success: success});  
                    });
                  }
                });
              });
        }
      });
    });
  }
});

//post the register
//var normal = require( '../functions/normal.js' );
router.post('/register', function (req, res, next) {
	//export the req, res and next
	exports.res = res;
	console.log(req.body) 
  req.checkBody('sponsor', 'Sponsor must not be empty').notEmpty();
  req.checkBody('sponsor', 'Sponsor must be between 8 to 25 characters').len(8,25);
  req.checkBody('username', 'Username must be between 8 to 25 characters').len(8,25);
  req.checkBody('fullname', 'Full Name must be between 8 to 25 characters').len(8,25);
  req.checkBody('pass1', 'Password must be between 8 to 25 characters').len(8,100);
  req.checkBody('pass2', 'Password confirmation must be between 8 to 100 characters').len(8,100);
  req.checkBody('email', 'Email must be between 8 to 105 characters').len(8,105);
  req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('code', 'Country Code must not be empty.').notEmpty();
  req.checkBody('pass1', 'Password must match').equals(req.body.pass2);
  req.checkBody('phone', 'Phone Number must be ten characters').len(10);
  req.checkBody('pin', 'Pin must be thirteen characters').len(13);
  req.checkBody('serial', 'Serial must be ten characters').len(10);
  /*req.checkBody('pass1', 'Password must have upper case, lower case, symbol, and number').matches((?=,*\d)(?=, *[a-z])(?=, *[A-Z])(?!, [^a-zA-Z0-9]).{8,}$/, "i")*/
 
  var errors = req.validationErrors();
	if (errors) { 
  	  console.log(JSON.stringify(errors));
  	  res.render('register', { title: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor});
  }else{
  	var username = req.body.username;
    var password = req.body.pass1;
    var cpass = req.body.pass2;
    var email = req.body.email;
    var fullname = req.body.fullname;
    var code = req.body.code;
    var phone = req.body.phone;
	var sponsor = req.body.sponsor;
	var pin = req.body.pin;
	var serial = req.body.serial;

    var db = require('../db.js');
    //check if sponsor is valid
    db.query('SELECT username, full_name, email FROM user WHERE username = ?', [sponsor], function(err, results, fields){
      if (err) throw err;
      if(results.length===0){
        var error = "This Sponsor does not exist";
        //req.flash( 'error', error)
        console.log(error);
        res.render('register', {title: "REGISTRATION FAILED", error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor});
      }else{
      		db.query('SELECT username FROM user WHERE username = ?', [username], function(err, results, fields){
          	if (err) throw err;
          	if(results.length===1){
          		var error = "Sorry, this username is taken";
            		console.log(error);
            		res.render('register', {title: "REGISTRATION FAILED", error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor});
          	}else{
          		db.query('SELECT email FROM user WHERE email = ?', [email], function(err, results, fields){
          			if (err) throw err;
          			if(results.length===1){
          				var error = "Sorry, this username is taken";
            				console.log(error);
            			}else{
            				db.query('SELECT * FROM pin WHERE serial = ?', [serial], function(err, results, fields){
          					if (err) throw err;
          					if(results.length === 0){
      								var error = 'serial does not exist';
      								res.render('register', {error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor, title: 'REGISTRATION UNSUCCESSFUL!'})
    							}else{
    								const hash = results[0].pin;
    								bcrypt.compare(pin, hash, function(err, response){
    									if(response === false){
          								var error = 'the pin does not exist';
          								res.render('register', {title: 'REGISTRATION UNSUSSESSFUL!', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor})
          							}else{
          								var user_pin = results[0].user;
          								console.log('user in the pin is' + user_pin);
          								if(user_pin !== null){
            								var error = 'pin has been  used already!'
            								res.render('register', {title: 'REGISTRATION UNSUSSESSFUL!', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor});
            								}else{
            									db.query('SELECT user FROM pin WHERE user = ?', [username], function(err, results, fields){
           		 								if (err) throw err;
           		 								if(results.length  >= 1){
           		 									var error = "Sorry, You cannot Join the Matrix because you are already in the matrix";
           		 								res.render('register', {title: 'REGISTRATION UNSUSSESSFUL!', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, pin: pin, serial: serial, sponsor: sponsor});
           		 								}else{
           		 									bcrypt.hash(password, saltRounds, null, function(err, hash){
           		 										db.query( 'CALL register(?, ?, ?, ?, ?, ?, ?, ?, ?)', [sponsor, fullname, phone, code, username, email, hash, 'active', 'no'], function(err, result, fields){
                    										if (err) throw err;
                    										db.query( 'UPDATE pin SET user = ? WHERE  serial = ?', [username, serial], function ( err, results, fields ){
                    											if( err ) throw err;
                    											//function for matrix
                    											matrix.normal(username, res);
                    										});
                    									});
                    								});
                    							}
                    						});			
            								}
          							}
        							});
    							}
          				});
            			}
          		});
          	}
          });
      }
    });
  }
});

module.exports = router;