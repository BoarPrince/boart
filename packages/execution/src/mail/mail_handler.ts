const assert = require('assert');
const { Subject } = require('rxjs');
const Utils = require('./utils');
const MailListener = require('mail-listener4');
const EnvLoader = require('./env_loader');

/**
 *
 */
export class MailItem {
    _seqno: any;
    html: any;
    subject: any;
    from: any;
    to: any;
    date: any;
    attachments: any;
    constructor(seqno: number, from: string, to: string, date: string, subject: string, html: string, attachments: string) {
        this._seqno = seqno;
        this.html = html;
        this.subject = subject;
        this.from = from;
        this.to = to;
        this.date = date;
        this.attachments = attachments;
    }
}

/**
 *
 */
class MailHandler {
    mailItemList: any[];
    onMailItem: any;
    mailListener: any;
    constructor() {
        this.mailItemList = [];
        this.onMailItem = new Subject();
    }

    stop() {
        this.onMailItem.complete();
        this.mailListener.stop();
    }

    async markAsRead(mailItem: MailItem) {
        this.mailListener.imap.seq.setFlags(mailItem._seqno, ['\\Seen'], (err: string) => {
            if (err) {
                console.error(err);
            }
        });

        this.mailItemList = this.mailItemList.filter((item) => {
            return item._seqno !== mailItem._seqno;
        });
    }

    async check(listener) {
        const timeMeasurement = Utils.TimeMeasurement;
        this.onMailItem.subscribe({
            next: (mailItems) => {
                mailItems.forEach((mailItem) => {
                    if (listener(mailItem)) {
                        timeMeasurement.stop();
                        Utils.addTimeMeasuringPoint('mail', `${mailItem.to[0].address} - ${mailItem.subject}`, timeMeasurement.duration);
                        this.markAsRead(mailItem);
                        this.onMailItem.complete();
                    }
                });
            },
            complete: () => {
                assert.ok(true);
            },
            error: (error) => {
                timeMeasurement.stop();
                Utils.addTimeMeasuringPoint('mail', `--- failed ---`, timeMeasurement.duration);
                assert.fail(error);
            }
        });

        this.onMailItem.next(this.mailItemList);
        await this.onMailItem.toPromise();
        this.onMailItem = new Subject();
    }

    async listen() {
        this.mailListener = new MailListener({
            username: EnvLoader.get('mail_username'),
            password: EnvLoader.get('mail_password'),
            host: EnvLoader.get('mail_host'),
            port: 993, // imap port
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            // debug: console.log,
            // mailbox: "INBOX", // mailbox to monitor
            // markSeen: true, // all fetched email willbe marked as seen and not fetched next time
            searchFilter: ['UNSEEN', ['SINCE', 'August 26, 2019']], // the search filter being used after an IDLE notification has been retrieved
            fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
            mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
            attachments: true, // download attachments as they are encountered to the project directory
            attachmentOptions: { directory: 'attachments/', stream: 'false' } // specify a download directory for attachments
        });

        try {
            console.log(`start mail listener`);
            this.mailListener.start(); // start listening
        } catch (error) {
            throw error;
        }

        this.mailListener.on('server:connected', () => {
            console.log(`ready...`);
            // console.log("imap successfully connected");
        });

        this.mailListener.on('server:disconnected', () => {
            // console.log("imap disconnected");
        });

        // this.mailListener.on("attachment", (attachment) => {
        //     console.log(attachment);
        // });

        this.mailListener.on('error', (err) => {
            console.error(err);
        });

        this.mailListener.on('tagged', (err) => {
            console.error(err);
        });

        this.mailListener.on('mail', (mail, seqno) => {
            const mailItem = new MailItem(seqno, mail.from, mail.to, mail.date, mail.subject, mail.html, mail.attachments);
            this.mailItemList.push(mailItem);
            this.onMailItem.next(this.mailItemList);
        });

        return this;
    }
}
