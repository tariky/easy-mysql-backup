# 💽 Easy MySQL Backup

This software creates snapshots of databases you define in config file. After that is creates .zip archive with all snapshots and finally it sends to offsite server.

## How to configure application

You can find files config-sample.mjs and mysql-config-sample.cnf in main directory. After cloning this repo rename config-sample.mjs to config.mjs and mysql-config-sample.cnf to mysql-config.cnf. This is very important becouse main app is using data from those files.

config.mjs
```javascript
const config = {
    // All databases you want to backup
	databases: ["test"],
    // Database username
	dbUser: "root",
    // Token for secure upload
    // Make sure that both reciever side and sender 
    // side have same token
	uploadToken: "123",
    // Just put offsite server domain or ip address
	offSiteAddress: "localhost:5000",
    // Define backup interval - see bree documentation for more info
    breeInterval: "1m",
};
```
Every property name is self explanatory. Just make sure you put database name in databases array.

mysql-config.cnf
```
[mysqldump]
user=root
password=123456789
```
This file will be used to connect with you MySQL server. user = username, password = password.

## How to configure bree intervals

To configure backup transfer intervals check bree documentation and just update config file with iterval you want to use. [Bree documentation](https://jobscheduler.net)

## Changelog

First version was using email as a way to transfer backup, but becouse backup can be bigger then 15mb, I decided to rewrite app so it can use sender/receiver for backup transfer.

2.0 [22.07.2022]
- Removed email support
- Added sender/reciever backup method
- node-cron removed
- bree is used for backup intervals

Wanna buy me coffee? [BUY COFFEE](https://www.buymeacoffee.com/tariky).