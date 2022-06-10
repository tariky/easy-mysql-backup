const config = {
    emailTo: "lorem@ipsum.com",
    emailFrom: "lorem@ipsum.com",
    emailSubject: "DB Backup",
    emailText: "Database is backed-up!",
    sendgridApi: "XXXXXXX",
    databases: ["test", "test2"],
    dbUser: "root",
    cron: "* * * * *"
}

export default config;