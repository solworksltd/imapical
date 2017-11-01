import ImapClient from 'emailjs-imap-client';
import IcalExpander from 'ical-expander';

class ImapIcal {
  constructor(opts) {
    this.opts = {
      host: opts.host,
      port: opts.port,
      auth: {
        user: opts.username,
        pass: opts.password,
      },
    };

    this.createMailboxBrowser();

    this.clients = [];
  }

  createMailboxBrowser() {
    return new Promise((resolve, reject) => {
      this.mailboxBrowser = new ImapClient(this.opts.host, this.opts.port || this.opts, this.opts);
      this.mailboxBrowser.logLevel = this.mailboxBrowser.LOG_LEVEL_NONE;

      return resolve();
    });
  }

  createMailboxClient(mailbox) {
    const { opts } = this;

    return new Promise((resolve, reject) => {
      if (!mailbox.path) {
        return reject('Mailbox must include a path');
      }

      const client = new ImapClient(opts.host, opts.port || opts, opts);
      client.logLevel = client.LOG_LEVEL_NONE;

      client.connect().then(() => {
        return client.selectMailbox(mailbox.path);
      }).then(() => {
        client.mailbox = mailbox.path;
        return resolve(client);
      });
    });
  }

  createMailboxClients() {
    return this.listMailboxes().then((mailboxes) => {
      return Promise.all(
        mailboxes.map((mailbox) => {
          return this.createMailboxClient(mailbox);
        })
      ).then((createdClients) => {
        this.clients = createdClients;
      });
    });
  }

  disconnectMailboxes() {
    return Promise.all(
      this.clients.map((client) => {
        return client.close();
      })
    ).then(() => {
      this.clients = [];
      return this.mailboxBrowser.close();
    }).then(() => {
      delete this.mailboxBrowser;
    });
  }

  listMailboxes() {
    return this.createMailboxBrowser().then(() => {
      return this.mailboxBrowser.connect();
    }).then(() => {
      return this.mailboxBrowser.listMailboxes().then((mailboxResults) => {
        return mailboxResults.children;
      });
    });
  }

  findCalAttachmentInBodyStructure(bodyStructure) {
    if (!bodyStructure.childNodes) {
      if (bodyStructure.type && bodyStructure.type === 'text/calendar') {
        return bodyStructure;
      }

      return null;
    }

    const matchingChildNodes = bodyStructure.childNodes.map((childNode) => {
      if (childNode.type === 'text/calendar') {
        return childNode;
      } else if (childNode.childNodes) {
        return this.findCalAttachmentInBodyStructure(childNode);
      }
    });

    return matchingChildNodes.find((matchingChildNode) => {
      return !!matchingChildNode;
    });
  }

  fetch() {
    return this.createMailboxClients().then(() => {
      return this.searchUnseenMails();
    }).then((clientSearchResults) => {
      return this.getMessagesForSearchResults(clientSearchResults);
    }).then((clientMessages) => {
      return this.getBodyPartsForMessages(clientMessages);
    }).then((clientsWithMessageBodyParts) => {
      return this.getAttachmentsFromBodyParts(clientsWithMessageBodyParts);
    }).then((messageAttachments) => {
      return this.disconnectMailboxes().then(() => {
        return Promise.all(
          messageAttachments.map((messageAttachment) => {
            const { attachment, message } = messageAttachment;
            const event = this.parseICAL(attachment);
            event['message-id'] = message.envelope['message-id'];

            return event;
          })
        );
      });
    });
  }

  getAttachmentsFromBodyParts(clientBodyParts) {
    return Promise.all(
      clientBodyParts.map(({ client, messagesWithBodyParts }) => {
        return Promise.all(
          messagesWithBodyParts.map((messageWithBodyParts) => {
            const { message, bodyParts } = messageWithBodyParts;
            const { encoding, part } = bodyParts;

            if (part) {
              return this.getMessagePart(client, message, part).then((messagesPart) => {
                const messagePart = messagesPart[0];
                let bodyPart = messagePart[`body[${bodyParts.part}]`];

                bodyPart = bodyPart.replace(/\r\n/g, '');

                if (encoding === 'base64') {
                  return {
                    message,
                    attachment: Buffer.from(bodyPart, 'base64').toString()
                  };
                }

                return bodyPart;
              });
            }

            /*
            * Special case not currently handled, email body is just an attachment, need to fetch
            */
            return null;
          })
        )
      })
    ).then((attachments) => {
      return attachments.reduce((acc, arr) => [...acc, ...arr], []);
    });
  }

  getBodyPartsForMessages(clientMessages) {
    return Promise.all(
      /*
       * Every imap message has a bodystructure that is either an attachment by itself, or is a description
       * of a set of 'parts' that form the body of the message. We need to extract those parts and identify
       * if there is a ical attachment present.
       *
       * Again we need to retain the email client instance so that when we try to fetch the attachment later
       * we have the original client for the mailbox selection.
       */
      clientMessages.map(({ client, messages }) => {
        return {
          client,
          messagesWithBodyParts: messages.map((message) => {
            return {
              message,
              bodyParts: this.findCalAttachmentInBodyStructure(message.bodystructure),
            }
          }),
        };
      })
    );
  }

  getMessagesForSearchResults(clientSearchResults) {
    return Promise.all(
      /*
       * We need to maintain access to the client object for every message, because to fetch the message parts later
       * we need to use the same client as it is configured for the mailbox to which the message belongs.
       */
      clientSearchResults.map(({ client, searchResults }) => {
        if (searchResults.length > 0) {
          return this.getMessageData(client, searchResults).then((messages) => {
            return {
              client,
              messages,
            }
          });
        }

        return {
          client,
          messages: [],
        };
      })
    );
  }

  /*
   * This is idempotent, fetching message headers does not change message 'seen' status, and using body.peek also
   * prevents 'seen' status from being set
   */
  getMessageData(client, messageSequence) {
    return client.listMessages(client.mailbox, messageSequence.join(','), ['uid', 'flags', 'envelope', 'bodystructure', 'body.peek[]']);
  }

  /*
   * This is a non-idempotent operation, fetching a body part of a message marks the message as seen
   */
  getMessagePart(client, message, part) {
    return client.listMessages(client.mailbox, message['#'], ['body[' + part + ']']);
  }

  parseICAL(ics) {
    const icalExpander = new IcalExpander({ ics });
    const { events } = icalExpander.all();
    const event = events[0];
    const parsedEvent = {};

    parsedEvent.attendees = event.attendees.map((attendee) => {
      const attendeeValue = attendee.getFirstValue();
      return attendeeValue.replace('MAILTO:', '');
    });

    parsedEvent.organiser = event.organizer.replace('MAILTO:', '');
    parsedEvent.description = event.description;
    parsedEvent.summary = event.summary;
    parsedEvent.startDate = event.startDate.toJSDate();
    parsedEvent.endDate = event.endDate.toJSDate();

    return parsedEvent;
  }

  searchUnseenMails() {
    return Promise.all(
      this.clients.map((client) => {
        return client.search(client.mailbox, { unseen: true }).then((searchResults) => {
          return {
            client,
            searchResults
          };
        });
      })
    );
  }
}

export default ImapIcal;
