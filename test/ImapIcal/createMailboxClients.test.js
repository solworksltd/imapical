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
    sinon.stub(imapClient, 'connect');

    imapClient.connect.returns(Promise.resolve());
  });

  return loadFixtures(test);
});

test('should create new clients for each available mailbox', t => {
  const randomMailboxes = Array.from({
    length: faker.random.number({max: 100 })
  }, () => { return {}; });

  const imapical = new ImapIcal({});

  sinon.stub(imapical, 'listMailboxes');
  sinon.stub(imapical, 'createMailboxClient');
  imapical.listMailboxes.returns(Promise.resolve(randomMailboxes));
  imapical.createMailboxClient.returns(Promise.resolve());

  const testPromise = imapical.createMailboxClients().then(() => {
    t.is(imapical.clients.length, randomMailboxes.length);
  });

  return testPromise;
});
