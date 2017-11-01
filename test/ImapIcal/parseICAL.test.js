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

test('should return the correct amount of attendees', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();

  const imapical = new ImapIcal({});
  const parsedEvent = imapical.parseICAL(ics);

  t.is(parsedEvent.attendees.length, 3);
});

test('should return the event summary', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();

  const imapical = new ImapIcal({});
  const parsedEvent = imapical.parseICAL(ics);

  t.is(parsedEvent.summary, 'Test invite from outlook');
});

test('should return the event organiser', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();

  const imapical = new ImapIcal({});
  const parsedEvent = imapical.parseICAL(ics);

  t.is(parsedEvent.organiser, 'dave@testsource.com');
});

test('should return the event start date', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();

  const imapical = new ImapIcal({});
  const parsedEvent = imapical.parseICAL(ics);

  t.is(parsedEvent.startDate.toISOString(), new Date('2017-10-31 09:00:00').toISOString());
});

test('should return the event end date', t => {
  const messages = test.fixtures['listMessages-PART'];
  const message = messages[0];
  let body = message['body[3]'];

  body = body.replace(/\r\n/g, '');
  const ics = Buffer.from(body, 'base64').toString();

  const imapical = new ImapIcal({});
  const parsedEvent = imapical.parseICAL(ics);

  t.is(parsedEvent.endDate.toISOString(), new Date('2017-10-31 09:30:00').toISOString());
});
