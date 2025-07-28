console.log("Start script");

// * Error: ENOENT: no such file or directory
// require('fs').readFileSync('README.mds');
//// require('fs').readFileSync('README.md');

// * ERR_INVALID_ARG_TYPE
require('url').format(0);
////require('url').format("/test");


// * Cannot find module
// require('nonexistent-module');
////require('fs'); // Replace with an existing core or installed module



// * Invalid URL
// new URL('http://?');
////new URL('http://example.com');



// * UnhandledPromiseRejection
// Promise.reject('fail');
//// Promise.reject('fail').catch(err => {  console.error('Handled rejection:', err);});
//// No .catch() → triggers unhandled rejection warning with this code




// * ENOTDIR: not a directory
// require('fs').readdirSync(__filename);
////require('fs').readdirSync(__dirname);


// * ERR_STREAM_WRITE_AFTER_END
// const w = require('fs').createWriteStream('test.txt');
// w.end(); w.write('x');
////w.write('x'); w.end();



// * AggregateError: write after end
// const w = require('fs').createWriteStream('/test.txt'); w.end(); w.write('data');
//// const w = require('fs').createWriteStream('/test.txt'); w.write('data'); w.end();



// * ERR_OUT_OF_RANGE
// require('buffer').Buffer.allocUnsafe(-1);
require('buffer').Buffer.allocUnsafe(10); // Use a valid, positive integer







// * Cannot find module 'does-not-exist'
// require('does-not-exist');
////require('fs');



//TypeError_ERR_INVALID_THIS
// const urlSearchParams = new URLSearchParams('foo=bar&baz=new');
// const buf = Buffer.alloc(1);
// urlSearchParams.has.call(buf, 'foo');
// Throws a TypeError with code 'ERR_INVALID_THIS' 



    // TypeError_ERR_INVALID_ARG_TYPE
    // Throws TypeError, since it expected a string. 
    // require('node:url').parse(() => { });
    //// require('node:url').parse('https://example.com');
 



//Buffer.allocUnsafe(1e10);



//require('fs').readFile(123, () => {});
////require('fs').readFile('file.txt', () => {}); // Path must be a string or Buffer



//ERR_UNSUPPORTED_ESM_URL_SCHEME
//import('ftp://example.com'); // in ESM context
////import('file:///' + process.cwd() + '/module.js'); // Must be http:, https:, file: etc.



// ERR_INVALID_ARG_TYPE
// const s = require('stream').PassThrough(); s.destroy(); s.write('x');
//// const s = require('stream').PassThrough(); s.write('x'); s.end();




// String.prototype.repeat.call('a', Infinity);
////String.prototype.repeat.call('a', 3); // finite number



// const http = require('http');http.createServer((req, res) => { res.end('a'); res.write('b'); }).listen();
//// const http = require('http');http.createServer((req, res) => {  res.write('a');  res.end();}).listen();


// require('http').STATUS_CODES[9999];
//// require('http').STATUS_CODES[404]; // Use a valid HTTP status code


// require('fs').openSync; // no native modules to fail here; placeholder
////require('fs'); // Keep to built-in or valid native modules


// const http = require('http');
// const req = http.request({ timeout: 1, host: '10.255.255.1' });
// req.end();
// req.on('error', e => console.error(e.code));
////const req = require('http').request({ timeout: 2000, host: 'example.com' }, res => {});req.end();


//ERR_TLS_CERT_ALTNAME_INVALID ?
// require('https').get({ hostname: 'wrong.host.badssl.com' }, () => {});
////require('https').get('https://example.com', res => {});


//certificate has expired ?
// require('https').get({ host: 'expired.badssl.com' }, () => {});
//// require('https').get('https://example.com', () => {});


//ERR_MODULE_NOT_FOUND ?
// import('lodash/some/nonexported.js');
//// import('lodash').then(_ => console.log(_.chunk([1, 2, 3], 2)));


// require('fs').readFileSync('/root/secret.txt');
////require('fs').readFileSync('./public.txt');


// const server = require('net').createServer(s => s.end());
// server.listen(3000, () => {
//     const c = require('net').connect(3000);
//     c.on('data', () => {});
//     c.write('hello');
//     });
    
//     ////s.write('hi');
//     ////s.end();
    

// ENOENT: no such file or directory ?
// require('fs').readFileSync('no-such.txt');
////if (require('fs').existsSync('exists.txt')) require('fs').readFileSync('exists.txt');



// require('fs').readFile("", () => {});
////require('fs').readFile('file.txt', () => {});

/*


*/



console.log("End script");