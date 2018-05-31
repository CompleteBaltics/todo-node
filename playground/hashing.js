const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// let data = {
//   id: 4
// };
//
// let token = jwt.sign(data, '123asdf');
// console.log(token);
//
// let decoded = jwt.verify(token, '123asdf');
// console.log(decoded);

// let message = 'im butnugget';
// let hash = SHA256(message).toString();
//
// console.log('Message:', message);
// console.log('Hash:', hash);
//
// let data = {
//   id: 4
// };
//
// let token = {
//   data,
//   hash: SHA256(JSON.stringify(data)+'addingSomeSolt').toString()
// };
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'addingSomeSolt').toString();
//
// if (token.hash === resultHash) {
//   console.log('Data intact');
// }else {
//   console.log('Data was tampared with');
// }

let password = '123abcc';
// bcrypt.genSalt(10, (err,salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash);
//   })
// });

let hash = '$2a$10$j6p8TeCaQcPjRjRdBes4Lex0/kRGWG5tsDbdm1FziXv1FMUu4VsZS';

bcrypt.compare(password, hash, (err, res) => {
  console.log(res);
});
