
const http = require('http');

function check(path) {
    const options = {
        hostname: 'localhost',
        port: 5175,
        path: path,
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        console.log(`PATH: ${path} | STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`BODY (${path}): ` + data.substring(0, 100).replace(/\n/g, ' '));
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request ${path}: ${e.message}`);
    });

    req.end();
}

check('/');
check('/index.html');
check('/test.html');
