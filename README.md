imapical
====

This module provides functionality for connecting to an IMAP server, listing unread emails, fetching said emails and attachments, and decoding iCalendar attachments into `Events`.

# Overview

`fetch()` is the primary method for the module, and calling this function triggers a set of operations that results in returning a list of `Events` currently awaiting processing from the mailbox.

When `fetch()` is called, the module connects a single IMAP client to the configured IMAP server, and lists all the available mailboxes. These mailboxes are `folders` that exist on the email account, such things as `Inbox`, `Sent`, `Spam`, etc. [emailjs-imap-client](https://github.com/emailjs/emailjs-imap-client) provides the functionality for IMAP connectivity.

When the list of mailboxes has been obtained, new IMAP clients are spawned for each of the available mailboxes. These clients then list all available, unread, mail that can currently be found in the mailbox the client belongs to.

Available mail is then fetched by each client, requesting certain header elements, and a `peek` of the mail body. This prevents the mail from being marked as read, meaning it will show up in future searches for `Unread` mail.

Once the `body` of the mails have been returned, these `bodies` are then scanned for `parts` that match the `text/calendar` mimetype. If such a `part` is found, the full body of this mail is subsequently fetched. This marks the mail as `Read` and prevents it from being fetched in future searches for `Unread` mail.

Once a `text/calendar` bodypart is fetched, it is converted from base64 if appropriate, and then decoded as a iCalendar file. [ical-expander](https://github.com/mifi/ical-expander) provides this functionality.

An object consisting of the `organiser` (originator) of the event, attendees, start and end date, description and summary of the event is then returned.

<div style="page-break-after: always;"></div>

# Usage

Construct a new imapical instance by passing relevant configuration parameters to the factory function:

```
const imapical = require('imapical');

const client = imapical({
  "username": "",
  "password": "",
  "host": "",
  "port": 0
});
```

`fetch()` can then be called on the new instance:

```
client.fetch().then((events) => {
  // Parsed events
});
```