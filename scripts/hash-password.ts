import bcrypt from 'bcryptjs';

const password = 'your-password-here'; // Replace this with your desired password
bcrypt.hash(password, 10).then(hash => {
  console.log('Your hashed password is:');
  console.log(hash);
}); 