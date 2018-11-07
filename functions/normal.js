var db = require( '../db.js' );
var newmatrix = require ('./newmatrix.js');
var newfeeder = require( './newfeederspill.js' );
exports.nospon = function(username, sponsor, res){
	//check if the person has an active matrix
	db.query('SELECT a, b, c FROM feeder_tree WHERE user = ?', [username], function(err, results, fields){
		if( err ) throw err;
		if (results.length === 0){
			//check if the user is already in the order section.
			db.query('SELECT payer FROM order WHERE payer = ?', [username], function(err, results, fields){
				if( err ) throw err;
				if (results.length === 0){
					//get the matrix right
					newmatrix.matrix(username, sponsor, res);
				}else{
					//restrict the user
					var error = 'You cannot join the matrix again because you have a pending order to pay. Please complete the order and try again.';
					res.render('status', {error: error});
				}
			});
		}else{
			//get variables for the a, b and call
			var last = results.slice(-1)[0];
			var user  = {
				a: last.a,
				b: last.b,
				c: last.c
			}
			//check if the a b and c is null
			if (user.a === null || user.b === null || user.c === null){
				//return the user to the join matrix
				var error = 'You cannot join the matrix again because you have a pending order to pay. Please complete the order and try again.';
				res.render('status', {error: error});
			}else{
				//get the first.
				db.query('SELECT user FROM feeder WHERE user = ?', [username], function(err, results, fields){
					if( err ) throw err;
					var user = results[0].user;
					newfeeder.feederspill( username, user, sponsor, res);
				});
			}
		}
	});
}