const AWS = require('aws-sdk');
const util = require('util');

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

	async createLog(name, logs) {
		return new Promise(async (resolve, reject) => {
			try {
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

				await this._sendLog(name, logs);
				return resolve();
			} catch (error) {
				return reject(error);
			}
		});
	}

	_formatMessages(logs) {
		let formatLogs = [];
		logs.forEach((log) => {
			formatLogs.push({
				message: String(log),
				timestamp: new Date().getTime()
			});
		});

		return formatLogs;
	}

	async _sendLog(name, logs) {
		return new Promise(async (resolve, reject) => {
			try {
				let paramsEvent = {
					logEvents: logs,
					logGroupName: this.logGroupName,
					logStreamName: name
				};
				return resolve(this._createLogStream(paramsEvent));
			} catch (error) {
				throw error;
			}
		});
	}

	async _putLogEventsCW(paramsEvent, tryNumbers = 0, token) {
		return new Promise(async (resolve, reject) => {
			try {
				let resp = await this.cloudwatchlogs.putLogEvents(paramsEvent).promise();
				return resolve({});
			} catch (error) {
				if (tryNumbers >= 10) {
					return reject(error);
				}
				if (
					error.code &&
					(error.code === 'InvalidSequenceTokenException' ||
						error.code === 'DataAlreadyAcceptedException')
				) {
					let numberToken = error.message.match(/\d+/);
					paramsEvent.sequenceToken = String(numberToken);
					await this._putLogEventsCW(paramsEvent, tryNumbers + 1);
					return resolve({});
				} else {
					return reject(error);
				}
			}
		});
	}

	async _createLogStream({ logGroupName, logStreamName, logEvents }) {
		let context = this;
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await this.cloudwatchlogs
					.createLogStream({ logGroupName, logStreamName })
					.promise();
				await context._putLogEventsCW({ logGroupName, logStreamName, logEvents });
				return resolve();
			} catch (error) {
				if (error && error.code && error.code === 'ResourceAlreadyExistsException') {
					await context._putLogEventsCW({ logGroupName, logStreamName, logEvents });
					return resolve();
				}
				return reject(error);
			}
			
		});
		
	}
}

module.exports = {
	simpleLogCloudwatch
};
