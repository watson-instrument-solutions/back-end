const jwt = require('jsonwebtoken');
const { User } = require('./models/UserModel');

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
		},

	);

	return newJwt;
}

async function authenticate(request, response, next) {
	try {
	  const token = request.header('Authorization')?.replace('Bearer ', '');
	  if (!token) throw new Error();
  
	  const decoded = jwt.verify(token, process.env.JWT_SECRET);
	  const user = await User.findById(decoded._id);
  
	  if (!user) throw new Error();
  
	  request.user = user;
	  next();
	} catch (error) {
	  response.status(401).json({ message: 'Please login' });
	}
  }

module.exports = {
    generateJwt, authenticate
}