import test from 'ava';
import faker from 'faker';
import sinon from 'sinon';
import ImapClient from 'emailjs-imap-client';

import loadFixtures from '../helpers/fixtureLoader';
import loadProxy from '../helpers/proxyLoader';

let ImapIcal;
let imapClient;

test.before(t => {
  ImapIcal = loadProxy(ImapClient, (_imapClient) => {
    imapClient = _imapClient;
  });

  return loadFixtures(test);
});

test('should return the correct amount of calendar events', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();
  const attachments = [{
    message: {
      envelope: {
        "message-id": `<${faker.random.alphaNumeric(26)}@${faker.internet.domainName()}>`
      }
    },
    attachment: ics,
  }];

  const imapical = new ImapIcal({});

  sinon.stub(imapical, 'createMailboxClients').returns(Promise.resolve());
  sinon.stub(imapical, 'searchUnseenMails').returns(Promise.resolve());
  sinon.stub(imapical, 'getMessagesForSearchResults').returns(Promise.resolve());
  sinon.stub(imapical, 'getBodyPartsForMessages').returns(Promise.resolve());
  sinon.stub(imapical, 'getAttachmentsFromBodyParts').returns(Promise.resolve(attachments));

  const testPromise = imapical.fetch().then((calendarEvents) => {
    t.is(calendarEvents.length, attachments.length);
  });

  return testPromise;
});

test('should assign an id to the calendar event matching the message the event was parsed from', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();
  const attachments = [{
    message: {
      envelope: {
        "message-id": `<${faker.random.alphaNumeric(26)}@${faker.internet.domainName()}>`
      }
    },
    attachment: ics,
  }];

  const imapical = new ImapIcal({});

  sinon.stub(imapical, 'createMailboxClients').returns(Promise.resolve());
  sinon.stub(imapical, 'searchUnseenMails').returns(Promise.resolve());
  sinon.stub(imapical, 'getMessagesForSearchResults').returns(Promise.resolve());
  sinon.stub(imapical, 'getBodyPartsForMessages').returns(Promise.resolve());
  sinon.stub(imapical, 'getAttachmentsFromBodyParts').returns(Promise.resolve(attachments));

  const testPromise = imapical.fetch().then((calendarEvents) => {
    const calendarEvent = calendarEvents[0];

    t.is(calendarEvent['message-id'], attachments[0].message.envelope['message-id']);
  });

  return testPromise;
});