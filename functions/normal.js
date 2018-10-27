var db = require( '../db.js' );
exports.nospon = function nospon(x, sponinherit, number, res){
	db.query('SELECT parent.sponsor, parent.user FROM user_tree AS node, user_tree AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? AND parent.feeder is not null ORDER BY parent.lft', [x], function(err, results, fields){
		if( err ) throw err;
		var last = results.slice(-1)[0];
		var user = last.user;
		db.query ('SELECT * FROM feeder_tree WHERE user = ?', [user], function(err, results, fields){
	 		if (err) throw err;
	 		var first = {
			 a: results[0].a,
			 b: results[0].b,
			 c: results[0].c
		 	}
		 	if(first.a === null && first.b === null && first.c === null){
		 		//get the user details from the user table.
		 		db.query ('SELECT full_name, phone, user_id, code FROM user WHERE username = ?', [user], function(err, results, fields){
		 			if (err) throw err;
		 			var contact = {
		 				name: results[0].full_name,
		 				phone: results[0].phone,
		 				code: results[0].code,
		 				id: results[0].user_id
		 			}
		 			// get the bank details to pay.
		 			db.query ('SELECT * FROM profile WHERE user = ?', [user], function(err, results, fields){
		 				if (err) throw err;
		 				var bank = {
		 					bank: results[0].bank,
		 					account_name: results[0].account_name,
		 					account_number: results[0].account_number
		 				}
		 				//insert into the a field.
		 					db.query('UPDATE feeder_tree SET a = ? WHERE user = ?', [x, user], function(err, results, fields){
								if(err) throw err;
								db.query('CALL leafadd(?,?,?)', [number, user, x], function(err, results, fields){
				  				if (err) throw err;
				  				//insert into the order database.
				  				db.query('CALL earings(user, contact.name, contact.phone, contact.code, bank.bank, bank.account_name, bank.account_number, x)', [user, name, phone, code, bank, account_name, account_number, x], function(err, results, fields){
				  					if (err) throw err;
				  					res.redirect('dashboard');
				  			});
							});
						});
		 			});
		 		});
			}
			//do the b section
			if(first.a !== null && first.b === null && first.c === null){
		 		//get the user details from the user table.
		 		db.query ('SELECT full_name, phone, user_id, code FROM user WHERE username = ?', [sponinherit], function(err, results, fields){
		 			if (err) throw err;
		 			var contact = {
		 				name: results[0].full_name,
		 				phone: results[0].phone,
		 				code: results[0].code,
		 				id: results[0].user_id
		 			}
		 			// get the bank details to pay.
		 			db.query ('SELECT * FROM profile WHERE user = ?', [sponinherit], function(err, results, fields){
		 				if (err) throw err;
		 				var bank = {
		 					bank: results[0].bank,
		 					account_name: results[0].account_name,
		 					account_number: results[0].account_number
		 				}
		 				//insert into the a field.
		 					db.query('UPDATE feeder_tree SET b = ? WHERE user = ?', [x, user], function(err, results, fields){
								if(err) throw err;
								db.query('CALL leafadd(?,?,?)', [number, user, x], function(err, results, fields){
				  				if (err) throw err;
				  				//insert into the order database.
				  				db.query('CALL earings(user, contact.name, contact.phone, contact.code, bank.bank, bank.account_name, bank.account_number, x)', [user, name, phone, code, bank, account_name, account_number, x], function(err, results, fields){
				  					if (err) throw err;
				  					res.redirect('dashboard');
				  			});
							});
						});
		 			});
		 		});
			}
			//do for c
			if(first.a !== null && first.b !== null && first.c === null){
		 		//get the user details from the user table.
		 		db.query ('SELECT full_name, phone, user_id, code FROM user WHERE username = ?', [user], function(err, results, fields){
		 			if (err) throw err;
		 			var contact = {
		 				name: results[0].full_name,
		 				phone: results[0].phone,
		 				code: results[0].code,
		 				id: results[0].user_id
		 			}
		 			// get the bank details to pay.
		 			db.query ('SELECT * FROM profile WHERE user = ?', [user], function(err, results, fields){
		 				if (err) throw err;
		 				var bank = {
		 					bank: results[0].bank,
		 					account_name: results[0].account_name,
		 					account_number: results[0].account_number
		 				}
		 				//insert into the a field.
		 					db.query('UPDATE feeder_tree SET c = ? WHERE user = ?', [x, user], function(err, results, fields){
								if(err) throw err;
								db.query('CALL leafadd(?,?,?)', [number, user, x], function(err, results, fields){
				  				if (err) throw err;
				  				//insert into the order database.
				  				db.query('CALL earings(user, contact.name, contact.phone, contact.code, bank.bank, bank.account_name, bank.account_number, x)', [user, name, phone, code, bank, account_name, account_number, x], function(err, results, fields){
				  					if (err) throw err;
				  					res.redirect('dashboard');
				  			});
							});
						});
		 			});
		 		});
			}
			// if the user is filled up.
			if(first.a !== null && first.b !== null && first.c !== null){
				//function for spillover.
			}
	 	});
	});
}