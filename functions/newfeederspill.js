var db = require( '../db.js' ); 
exports.feederspill = function feederspill( username, user, sponsor, res){
	db.query('SELECT node.user,   (COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM feeder AS node, feeder AS parent, feeder AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM feeder AS node, feeder AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.amount < 3 AND node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user = sub_tree.user GROUP BY node.user HAVING depth > 0 ORDER BY depth', [user], function(err, results, fields){
		if( err ) throw err;
		var feederdepth = results[0].depth;
		db.query('SELECT node.user,   (COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM feeder AS node, feeder AS parent, feeder AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM feeder AS node, feeder AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.amount = 0 AND node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user = sub_tree.user GROUP BY node.user HAVING depth > 0 ORDER BY depth', [user], function(err, results, fields){
			if (err) throw err;
			var feeder1spill = {
				user: results[0].user,
				depth: results[0].depth,
				amount: results[0].amount
			}
			if (feeder1spill.depth === feederdepth){
				//start the journey to fill in a
				db.query('UPDATE feeder_tree SET a = ? WHERE user = ?', [username, user], function(err, results, fields){
					if(err) throw err;
					//call the procedure for adding
					db.query('CALL leafadd(?,?)', [user, username], function(err, results, fields){
						if (err) throw err;
						//get the account details of the user
						db.query('SELECT * FROM profile WHERE user = ?', [user], function(err, results, fields){
							if ( err ) throw err;
							var bank = {
								bank: results[0].bank,
								account_name: results[0].account_name,
								account_number: results[0].account_number
							}
							//get the phone number of the user
							db.query('SELECT full_name, phone, code FROM user WHERE username = ?', [user], function(err, results, fields){
								if ( err ) throw err;
								//get the user details
								var contact = {
									full_name: results[0].full_name,
									phone: results[0].phone,
									code: results[0].code
								}
								//enter it into the order table
								db.query('CALL earnings(?,?,?,?,?,?,?,?)', [user, contact.full_name, contact.phone, contact.code, bank.bank, bank. account_name, bank.account_number], function(err, results, fields){
									if (err) throw err;
									res.redirect('dashboard');
								});
							});
						});
					});
				});
			}else{
				db.query('SELECT node.user,   (COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM feeder AS node, feeder AS parent, feeder AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM feeder AS node, feeder AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.amount = 1 AND node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user = sub_tree.user GROUP BY node.user HAVING depth > 0 ORDER BY depth', [user], function(err, results, fields){ 
					if( err ) throw err;
					if ( results.length === 0 ){
						//check the two
						db.query('SELECT node.user,   (COUNT(parent.user) - (sub_tree.depth + 1)) AS depth FROM feeder AS node, feeder AS parent, feeder AS sub_parent, ( SELECT node.user, (COUNT(parent.user) - 1) AS depth FROM feeder AS node, feeder AS parent WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.user = ? GROUP BY node.user ORDER BY node.lft) AS sub_tree WHERE node.amount = 2 AND node.lft BETWEEN parent.lft AND parent.rgt AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt AND sub_parent.user = sub_tree.user GROUP BY node.user HAVING depth > 0 ORDER BY depth', [user], function(err, results, fields){	
							if( err ) throw err;
							//start the two
							var feeder3spill = {
								user: results[0].user,
								depth: results[0].depth,
								amount: results[0].amount
							}
							if (feeder3spill.depth === feederdepth){
								db.query('UPDATE feeder_tree SET c = ? WHERE user = ?', [username, user], function(err, results, fields){
									if(err) throw err;
									//call the procedure for adding
									db.query('CALL leafadd(?,?)', [user, username], function(err, results, fields){
										if (err) throw err;
										//get the account details of the user
										db.query('SELECT * FROM profile WHERE user = ?', [user], function(err, results, fields){
											if ( err ) throw err;
											var bank = {
												bank: results[0].bank,
												account_name: results[0].account_name,
												account_number: results[0].account_number
											}
											//get the phone number of the user
											db.query('SELECT full_name, phone, code FROM user WHERE username = ?', [user], function(err, results, fields){
												if ( err ) throw err;
												//get the user details
												var contact = {
													full_name: results[0].full_name,
													phone: results[0].phone,
													code: results[0].code
												}
												//enter it into the order table
												db.query('CALL earnings(?,?,?,?,?,?,?,?)', [user, contact.full_name, contact.phone, contact.code, bank.bank, bank. account_name, bank.account_number], function(err, results, fields){
													if (err) throw err;
													res.redirect('dashboard');
												});
											});
										});
									});
								});
							}
						});
					}else{
						db.query('UPDATE feeder_tree SET b = ? WHERE user = ?', [username, user], function(err, results, fields){
							if(err) throw err;
							//call the procedure for adding
							db.query('CALL leafadd(?,?)', [user, username], function(err, results, fields){
								if (err) throw err;
								//check for the sponsor of the boss which is user.
								db.query('SELECT sponsor FROM user WHERE username = ?', [sponsor], function(err, results, fields){
									if ( err ) throw err;
									var spon = results[0].sponsor;
									//check if the sponsor has a valid matrix.
									db.query('SELECT a, b, c FROM feeder_tree WHERE user = ?', [spon], function(err, results, fields){
										if( err ) throw err;
										if(results.length === 0){
											var sponinherit = 'miracle0403';
											//rest of the matrix
											//get the account details of the user
											db.query('SELECT * FROM profile WHERE user = ?', [sponinherit], function(err, results, fields){
												if ( err ) throw err;
												var bank = {
													bank: results[0].bank,
													account_name: results[0].account_name,
													account_number: results[0].account_number
												}
												//get the phone number of the user
												db.query('SELECT full_name, phone, code FROM user WHERE username = ?', [sponinherit], function(err, results, fields){
													if ( err ) throw err;
													//get the user details
													var contact = {
														full_name: results[0].full_name,
														phone: results[0].phone,
														code: results[0].code
													}
													//enter it into the order table
													db.query('CALL penalty(?,?,?,?,?,?,?,?)', [user, contact.full_name, contact.phone, contact.code, bank.bank, bank. account_name, bank.account_number], function(err, results, fields){
														if (err) throw err;
														res.redirect('dashboard');
													});
												});
											});
										}else{
											//get the variables for the sponinherit
											var last = results.slice(-1)[0];
											var use  = {
												a: last.a,
												b: last.b,
												c: last.c
											}
											if (use.a === null || use.b === null || use.c === null){
												//what to do... rest of the matrix.
												var sponinherit = spon;
												//get the account details of the user
												db.query('SELECT * FROM profile WHERE user = ?', [sponinherit], function(err, results, fields){
													if ( err ) throw err;
													var bank = {
														bank: results[0].bank,
														account_name: results[0].account_name,
														account_number: results[0].account_number
													}
													//get the phone number of the user
													db.query('SELECT full_name, phone, code FROM user WHERE username = ?', [sponinherit], function(err, results, fields){
														if ( err ) throw err;
														//get the user details
														var contact = {
															full_name: results[0].full_name,
															phone: results[0].phone,
															code: results[0].code
														}
														//enter it into the order table
														db.query('CALL feederbonus(?,?,?,?,?,?,?,?)', [user, contact.full_name, contact.phone, contact.code, bank.bank, bank. account_name, bank.account_number], function(err, results, fields){
															if (err) throw err;
															res.redirect('dashboard');
														});
													});
												});
											}else{
												//take back to the admin.
												var sponinherit = 'miracle0403';
												//rest of the matrix
												//get the account details of the user
												db.query('SELECT * FROM profile WHERE user = ?', [sponinherit], function(err, results, fields){
													if ( err ) throw err;
													var bank = {
														bank: results[0].bank,
														account_name: results[0].account_name,
														account_number: results[0].account_number
													}
													//get the phone number of the user
													db.query('SELECT full_name, phone, code FROM user WHERE username = ?', [sponinherit], function(err, results, fields){
														if ( err ) throw err;
														//get the user details
														var contact = {
															full_name: results[0].full_name,
															phone: results[0].phone,
															code: results[0].code
														}
														//enter it into the order table
														db.query('CALL penalty(?,?,?,?,?,?,?,?)', [user, contact.full_name, contact.phone, contact.code, bank.bank, bank. account_name, bank.account_number], function(err, results, fields){
															if (err) throw err;
															res.redirect('dashboard');
														});
													});
												});
											}
										}
									});
								});
							});
						});
					}
				});
			}
		});
	});
}