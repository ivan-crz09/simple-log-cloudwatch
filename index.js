class simpleLogCloudwatch {
	constructor() {
        console.log('pruebaaaaaaaa')
    }
	config = () => {
		try {
			if (!config.aws || !config.cw) {
				throw new Error('You need to stablish the credentialsssssssss');
			}
			AWS.config.update(config.aws);
			//{apiVersion: {a.cw}}
			cloudwatchlogs = new AWS.CloudWatchLogs({
				apiVersion: config.cw.apiVersion
			});
		} catch (error) {
			throw error;
		}
	};
}

module.exports = {
    simpleLogCloudwatch
} 