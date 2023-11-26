const jwt = require('jsonwebtoken');
const { User } = require('./models/UserModel');

require('dotenv').config();

function generateJwt(userId){
	let token = jwt.sign(
		// Payload
		{
			userId
		}, 
		// Secret key for server-only verification
		process.env.JWT_SECRET,
		// Valid for 1 day
		{
			expiresIn: "24h"
		},
	);
	return token;
}

async function authenticate(request, response, next) {
	try {
	  const token = request.header('Authorization').replace("Bearer ", "");
	//   jwt troubleshooting
	  console.log('Verifying Token:', token);
	  if (!token) throw new Error();
  
	  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });;
	  const user = await User.findOne({ _id: decoded.userId });
  
	  if (!user) throw new Error();
  
	  request.user = user;
	  next();
	} catch (error) {
		// troubleshooting jwt issues
		console.error('Authentication Error:', error.message);
		// if (token){ 
  		// console.error('Token:', token);
		// }
	  response.status(401).json({ message: 'Please login' });
	}
  }

module.exports = {
    generateJwt, authenticate
}