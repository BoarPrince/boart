const { fork } = require('child_process');

const child = fork('child', {
    silent: true
});

child.stderr.on('data', (data) => {
    console.log('stderr: ' + data);
});

child.stdout.on('data', (data) => {
    console.log('stdout: ' + data);
});

function callChild(message) {
    return new Promise((resolve, reject) => {
        // const messageListener = (msgFromClient) => resolve(msgFromClient);
        // child.once('message', messageListener);
        child.once('message', (msgFromClient) => {
            msgFromClient.error //
                ? reject(msgFromClient.error)
                : resolve(msgFromClient.data);
        });
        // child.once('error', (error) => reject(error));
        // child.once('uncaughtException', (error) => reject(error));
        child.send(message);
    });
}

(async () => {
    let index = 0;
    setInterval(async () => {
        try {
            const firstMessage = await callChild('first');
            console.log('firstMessage ' + index++, firstMessage);
        } catch (error) {
            console.error('error occured:', error);
        }
    }, 100);

    // process.exit(0);
})();
