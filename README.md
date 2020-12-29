#  Simple Log Cloudwatch
This library is useful to send logs to cloudwatch. 

## Getting Started

### Installation
Install via NPM:
```
npm install simple-log-cloudwatch
```
 ---
### Using

 Import the package once it is installed

```
const { simpleLogCloudwatch }  =  require('simple-log-cloudwatch');
```

Next step is to set the credentials

```
const simpleLog = new simpleLogCloudwatch({
    logGroupName: 'xxxx', 
    region: 'xxxxx', 
    accessKeyId: 'xxxxx', 
    secretAccessKey: 'xxxxxxxx',
    apiVersionCloudwatch: 'xxxxxx'
});

```

===========================================

You need to create the **Log Group** inside of [AWS](https://console.aws.amazon.com/). 

===========================================


Finally to save the logs in **Cloudwatch** you need to invoke the function **createLog** and pass **two parameters**

===========================================
##### Log Stream
*type*: String

*value*: Name of the Log Event (Example: '29-12-2020')

##### Messages
*type*: Array of String

*value*: Messages that will be send it to Cloudwatch

===========================================

```
simpleLog.createLog("29-12-2020",["test-message-1","test-message-2"])
```

---
#### Example
```
//import 
const { simpleLogCloudwatch }  =  require('simple-log-cloudwatch');

//set the credentials of aws
const simpleLog = new simpleLogCloudwatch({
    logGroupName: 'xxxx', 
    region: 'xxxxx', 
    accessKeyId: 'xxxxx', 
    secretAccessKey: 'xxxxxxxx',
    apiVersionCloudwatch: 'xxxxxx'
});


//create the logs
log4Cloudwatch.createLog("01-01-2020",["test-message-1","test-message-2"])
```
---
### Additional Info

 - You need to have the permission to *create* **Log Stream** in **Cloudwatch**
 - You need to have the permission to *put* **Log Events** in **Cloudwatch**
 - You need to create **first** the **Log Group** inside of [AWS](https://console.aws.amazon.com/)
