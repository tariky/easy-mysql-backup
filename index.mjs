import config from "./config.mjs";
import { exec } from "child_process";
import { nanoid } from "nanoid";
import fsExtra from "fs-extra";
import figlet from "figlet";
import sgMail from "@sendgrid/mail";
import AdmZip from "adm-zip";
import util from "node:util";
import ora from "ora";
import dayjs from "dayjs";
import cron from "node-cron";

const promisedExec = util.promisify(exec);

const log = console.log;
const { databases, emailFrom, emailSubject, emailText, emailTo, sendgridApi } =
  config;

// Setup SendGrid API
sgMail.setApiKey(sendgridApi);

async function renderArt() {
  await new Promise((resolve, reject) => {
    console.clear();
    figlet("EMdB", function (err, data) {
      if (err) {
        reject("Something went wrong...")
        return;
      }
      resolve(log(data));
    });  
  })
}


async function dumpAllDatabases() {
  const promiseArray = databases.map(async (database) => {
    const dbSpinner = ora("Backing up database...").start();
    await promisedExec(
      `mysqldump --defaults-extra-file=./mysql-config.cnf -u root ${database} > snapshots/snapshot-${database}-${nanoid(
        6
      )}.sql`
    );
    dbSpinner.stopAndPersist({ text: `Backup completed - Database: ${database}`, symbol: "✅" })
  });
  await Promise.all(promiseArray);
}

async function zipFiles() {
  const zipSpinner = ora("Zipping all snapshots...").start();
  await new Promise((resolve, reject) => {
    const zip = new AdmZip();
    zip.addLocalFolder("./snapshots");
    zip.writeZip("snapshots.zip", (err) => {
      if (err) {
        reject("There is something wrong with files zipping!");
      }
      resolve();
    });
    zipSpinner.stopAndPersist({ text: "Zip archive created", symbol: "🗄️" })
  });
}

async function deleteSnapshotFolder() {
  const deleteOra = ora("Deleting snapshots...").start();
  await new Promise((resolve, reject) => {
    fsExtra.emptyDir("./snapshots", () => {
      deleteOra.stopAndPersist({ text: "All snapshots deleted", symbol: "🗑️" })
      resolve();
    });
  });
}

async function sendEmailWithSnapshots() {
  const spinner = ora('Sending E-Mail...').start();
  const pathToAttachment = `./snapshots.zip`;
  const attachment = fsExtra.readFileSync(pathToAttachment).toString("base64");

  const msg = {
    to: emailTo,
    from: emailFrom,
    subject: `${emailSubject} - ${dayjs().format("YYYY-MM-DDTHH:mm:ss")}`,
    text: emailText,
    html: emailText,
    attachments: [
      {
        content: attachment,
        filename: "snapshots.zip",
        type: "application/zip",
        disposition: "attachment",
      },
    ],
  };

  sgMail
    .send(msg)
    .then(() => {
      spinner.stopAndPersist({ text: `E-Mail with backup sended to: ${emailTo}`, symbol: "📧" })
    })
    .catch((error) => {
      console.error(error);
    });
}

cron.schedule(config.cron, async () => {
  console.log('will execute two minute until stopped');
  await renderArt();
  await dumpAllDatabases();
  await zipFiles();
  await deleteSnapshotFolder();
  await sendEmailWithSnapshots();
});
