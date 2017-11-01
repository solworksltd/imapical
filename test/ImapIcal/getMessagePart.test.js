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

test('should get message part for the correct mailbox', t => {
  const client = {
    listMessages: sinon.stub().returns(Promise.resolve()),
    mailbox: faker.random.word(),
  };

  const message = {
    '#': [faker.random.number()],
  };

  const part = faker.random.number();

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessagePart(client, message, part).then(() => {
    t.true(client.listMessages.calledWith(client.mailbox));
  });

  return testPromise;
});

test('should get the correct messages', t => {
  const client = {
    listMessages: sinon.stub().returns(Promise.resolve()),
  };

  const message = {
    '#': [faker.random.number()],
  };

  const part = faker.random.number();

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessagePart(client, message, part).then(() => {
    t.true(client.listMessages.calledWith(sinon.match.any, message['#']));
  });

  return testPromise;
});

test('should request the correct part', t => {
  const client = {
    listMessages: sinon.stub().returns(Promise.resolve()),
  };

  const message = {
    '#': [faker.random.number()],
  };

  const part = faker.random.number();

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessagePart(client, message, part).then(() => {
    t.true(client.listMessages.calledWith(sinon.match.any, sinon.match.any, ['body[' + part + ']']));
  });

  return testPromise;
});

test('should return the message part', t => {
  const messages = test.fixtures['listMessages-PART'];

  const client = {
    listMessages: sinon.stub().returns(Promise.resolve(messages)),
  };

  const message = {
    '#': [faker.random.number()],
  };

  const part = faker.random.number();

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessagePart(client, message, part).then((messageData) => {
    t.is(messageData, messages);
  });

  return testPromise;
});
