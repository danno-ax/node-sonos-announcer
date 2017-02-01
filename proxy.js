const express = require('express');
const requestProxy = require('express-request-proxy');
const { apiUrl, appUrl, host = '0.0.0.0', port = 3000 } = require('yargs')
    .demandOption(['apiUrl', 'appUrl'])
    .option('port', {
        describe: 'http server port'
    })
    .option('host', {
        describe: 'http server host'
    })
    .argv;
const app = express();
app.all('/api*', requestProxy({
    url: `${apiUrl}/*`,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
}));
app.all('/*', requestProxy({
    url: `${appUrl}/*`,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
}));

app.listen(port, host, () => {
    console.log(`Listening on ${host}:${port}`)
});
