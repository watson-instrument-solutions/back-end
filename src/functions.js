const jwt = require('jsonwebtoken');

function generateJwt(userId){

	let newJwt = jwt.sign(
		// Payload
		{
			userId
		}, 

		// Secret key for server-only verification
		"insert secret key here",

		// Options
		{
			expiresIn: "24h"
		}

	);

	return newJwt;
}

module.exports = {
    generateJwt
}