const bcrypt = require('bcryptjs');

const testPassword = 'xondam-dybwi3-raMbid';

console.log('Testing password hashing and comparison...');
console.log('Original password:', testPassword);

// Hash the password
const hashedPassword = bcrypt.hashSync(testPassword, 10);
console.log('Hashed password:', hashedPassword);

// Test comparison
const isValid = bcrypt.compareSync(testPassword, hashedPassword);
console.log('Password comparison result:', isValid);

// Test with a different password
const isValidWrong = bcrypt.compareSync('wrongpassword', hashedPassword);
console.log('Wrong password comparison result:', isValidWrong); 