const AWS = require('aws-sdk');

class simpleLogCloudwatch {
	constructor(config) {
		this.checkConfig(config);
	}

	checkConfig({ logGroupName, apiVersionCloudwatch, region, accessKeyId, secretAccessKey }) {
		try {
			if (!logGroupName) {
				throw new Error(`Missing required argument: 'logGroupName' is required.`);
			}

			if (!region) {
				throw new Error(`Missing required argument: 'region' is required.`);
			}

			if (!accessKeyId) {
				throw new Error(`Missing required argument: 'accessKeyId' is required.`);
			}

			if (!secretAccessKey) {
				throw new Error(`Missing required argument: 'secretAccessKey' is required.`);
			}

			if (!apiVersionCloudwatch) {
				throw new Error(`Missing required argument: 'apiVersionCloudwatch' is required.`);
			}

			this.configAWS({ logGroupName, apiVersionCloudwatch, region, accessKeyId, secretAccessKey });
		} catch (error) {
			throw error;
		}
	}

	configAWS({ logGroupName, apiVersionCloudwatch, region, accessKeyId, secretAccessKey }) {
		try {
			AWS.config.update({
				accessKeyId,
				secretAccessKey,
				region
			});

			this.logGroupName = logGroupName;
			this.cloudwatchlogs = new AWS.CloudWatchLogs({
				apiVersion: apiVersionCloudwatch
			});
		} catch (error) {
			throw error;
		}
	}

	createLog(name, logs) {
		if (!name) {
			throw new Error(`Missing required argument: 'name' log event`);
		}

		if (typeof name !== 'string') {
			throw new Error(`Error type : 'name' needs to be string`);
		}

		if (!logs) {
			throw new Error(`Missing required argument: 'logs'`);
		}

		if (!Array.isArray(logs)) {
			throw new Error(`Error type: 'logs' needs to be an Array`);
		}

		logs = this._formatMessages(logs);

		this._sendLog(name, logs);
	}

	_formatMessages(logs) {
		let formatLogs = [];
		logs.forEach((log) => {
			formatLogs.push({
				message: log,
				timestamp: new Date().getTime()
			});
		});

		return formatLogs;
	}

	_sendLog(name, logs) {
		try {
			let paramsEvent = {
				logEvents: logs,
				logGroupName: this.logGroupName,
				logStreamName: name
			};
			this._createLogStream(paramsEvent);
		} catch (error) {
			throw error;
		}
	}

	_putLogEventsCW(paramsEvent, tryNumbers = 0, token) {
		let context = this;
		this.cloudwatchlogs.putLogEvents(paramsEvent, function (err, data) {
			try {
				if (err) {
					if (tryNumbers >= 5) {
						throw err;
					}
					if (
						err.code &&
						(err.code === 'InvalidSequenceTokenException' ||
							err.code === 'DataAlreadyAcceptedException')
					) {
						let numberToken = err.message.match(/\d+/);
						paramsEvent.sequenceToken = String(numberToken);
						context._putLogEventsCW(paramsEvent, tryNumbers + 1);
					} else {
						throw err;
					}
				}
			} catch (error) {
				throw error;
			}
		});
	}

	_createLogStream({ logGroupName, logStreamName, logEvents }) {
		let context = this;
		this.cloudwatchlogs.createLogStream({ logGroupName, logStreamName }, function (err, data) {
			if (err) {
				if (err.code === 'ResourceAlreadyExistsException') {
					context._putLogEventsCW({ logGroupName, logStreamName, logEvents });
				} else {
					throw err;
				}
			}else{
				context._putLogEventsCW({ logGroupName, logStreamName, logEvents });
			}
		});
	}
}

module.exports = {
	simpleLogCloudwatch
};
