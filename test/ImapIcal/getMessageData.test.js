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

test('should get messages for the correct mailbox', t => {
  const client = {
    listMessages: sinon.stub().returns(Promise.resolve()),
    mailbox: faker.random.word(),
  };

  const messageSequence = [faker.random.number()];

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessageData(client, messageSequence).then(() => {
    t.true(client.listMessages.calledWith(client.mailbox));
  });

  return testPromise;
});

test('should get the correct messages', t => {
  const client = {
    listMessages: sinon.stub().returns(Promise.resolve()),
  };

  const messageSequence = [faker.random.number()];

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessageData(client, messageSequence).then(() => {
    t.true(client.listMessages.calledWith(sinon.match.any, messageSequence.join(',')));
  });

  return testPromise;
});

test('should return the message data', t => {
  const messages = test.fixtures['listMessages'];

  const client = {
    listMessages: sinon.stub().returns(Promise.resolve(messages)),
  };

  const messageSequence = [faker.random.number()];

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessageData(client, messageSequence).then((messageData) => {
    t.is(messageData, messages);
  });

  return testPromise;
});
