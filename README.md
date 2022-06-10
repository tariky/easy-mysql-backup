# 💽 Easy MySQL Backup

This software creates snapshots of databases you define in config file. After that is creates .zip archive with all snapshots and finally it sends it to your e-mail.
It sends email's with intervals you define in config file.

Main reason I created this project is lack of good and easy solution for MySQL backup. 

For email sending service I use SendGrid. They have free plan with 100/emails per day. This is more then enough for me. If you choose to use SendGrid just create free account and get API key.
> Just note that SendGrid recommend that your attachments do not exceed 10MB.

[Create SendGrid account](https://signup.sendgrid.com/)

## How to configure application

You can find files config-sample.mjs and mysql-config-sample.cnf in main directory. After cloning this repo rename config-sample.mjs to config.mjs and mysql-config-sample.cnf to mysql-config.cnf. This is very important becouse main app is using data from those files.

config.mjs
```javascript
const config = {
    emailTo: "lorem@ipsum.com",
    emailFrom: "lorem@ipsum.com",
    emailSubject: "DB Backup",
    emailText: "Hurray! New backup is completed! 😺",
    sendgridApi: "XXXXXXX",
    databases: ["test", "test2"],
    dbUser: "root",
    cron: "* * * * *"
}
```
Every property name is self explanatory. Just make sure you put database name in databases array.

mysql-config.cnf
```
[mysqldump]
user=root
password=123456789
```
This file will be used to connect with you MySQL server. user = username, password = password.

## How to configure CRON (schedule)

This project use node-cron library for CRON jobs. You just need to configure cron property in config.mjs. For format and more info visit [node-cron](https://github.com/node-cron/node-cron)

Wanna buy me coffee? [BUY COFFEE](https://www.buymeacoffee.com/tariky).