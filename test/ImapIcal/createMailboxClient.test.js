import test from 'ava';
import faker from 'faker';
import sinon from 'sinon';
import ImapClient from 'emailjs-imap-client';

import loadFixtures from '../helpers/fixtureLoader';
import loadProxy from '../helpers/proxyLoader';

let imapClient;
let ImapIcal;

test.before(t => {
  ImapIcal = loadProxy(ImapClient, (_imapClient) => {
    imapClient = _imapClient;
    sinon.stub(imapClient, 'connect');
    sinon.stub(imapClient, 'selectMailbox');

    imapClient.connect.returns(Promise.resolve());
    imapClient.selectMailbox.returns(Promise.resolve());
  });

  return loadFixtures(test);
});

test('should create a client and connect', t => {
  const mailbox = {
    path: faker.random.word(),
  };

  const opts = {};

  const imapical = new ImapIcal({});

  const testPromise = imapical.createMailboxClient(mailbox, opts).then((createdClient) => {
    t.true(imapClient.connect.called);
  });

  return testPromise;
});

test('should store the mailbox to select', t => {
  const mailbox = {
    path: faker.random.word(),
  };

  const opts = {};

  const imapical = new ImapIcal({});

  const testPromise = imapical.createMailboxClient(mailbox, opts).then((createdClient) => {
    t.is(createdClient.mailbox, mailbox.path);
  });

  return testPromise;
});

test('should select the mailbox', t => {
  const mailbox = {
    path: faker.random.word(),
  };

  const opts = {};

  const imapical = new ImapIcal({});

  const testPromise = imapical.createMailboxClient(mailbox, opts).then((createdClient) => {
    t.true(imapClient.selectMailbox.calledWith(mailbox.path));
  });

  return testPromise;
});
