import SpeedTest from 'speedtest-net'
import metrics from 'datadog-metrics'

const SPEED_TEST_INTERVAL_MIN = process.env.SPEED_TEST_INTERVAL_MIN || 20;
const SPEED_TEST_HOST = process.env.SPEED_TEST_HOST || 'ISP';

metrics.init({
    host: SPEED_TEST_HOST,
    prefix: 'isp.'
});

uploadBandwidth(() => {
    console.log(`Sleeping for ${SPEED_TEST_INTERVAL_MIN} min`);
});

const WAIT_MS = SPEED_TEST_INTERVAL_MIN * 60 * 1000;

setInterval(() => {
    uploadBandwidth(() => {
        console.log(`Sleeping for ${SPEED_TEST_INTERVAL_MIN} min`);
    });
}, WAIT_MS);

function uploadBandwidth(callback) {
    console.log("Running speed test...");
    var test = SpeedTest({maxTime: 5000});

    test.on('error', err => {
        console.error(err);
        return;
    });

    test.on('data', testData => {
        console.log(`Uploading results for ${SPEED_TEST_HOST}...`);
        var dlSpeed = testData.speeds.download;
        var ulSpeed = testData.speeds.upload;
        var ping = testData.server.ping;
        metrics.gauge('speed.download', dlSpeed);
        metrics.gauge('speed.upload', ulSpeed);
        metrics.gauge('ping', ping);
        if(callback) {
            callback();
        };
    });
}
