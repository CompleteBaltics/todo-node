const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

let data = {
  id: 4
};

let token = jwt.sign(data, '123asdf');
console.log(token);

let decoded = jwt.verify(token, '123asdf');
console.log(decoded);

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
