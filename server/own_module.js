// var fs = require('fs');
//
// // module.exports = fileExist;
//
export {
  fnt1
};

function fnt1(a, b) {
  return a + b;
}

// var fileExist = (file_in, file_out) => {
//   // does file_in exist ?
//   if (!file_in) {
//     return new Promise((resolve, reject) => {
//       reject('function fileExist: invalid parmeters');
//     });
//   }
//   return new Promise((resolve, reject) => {
//     fs.access(file_in, (err) => {
//       if (err && err.code === 'ENOENT') {
//         reject('function fileExist: file ' + file_in + ' does not exist');
//       } else {
//         resolve({
//           file_in: file_in,
//           file_out: file_out
//         });
//       }
//     });
//   });
// };
