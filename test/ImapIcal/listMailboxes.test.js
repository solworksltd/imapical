import test from 'ava';
import faker from 'faker';
import sinon from 'sinon';
import ImapClient from 'emailjs-imap-client';

import loadFixtures from '../helpers/fixtureLoader';
import loadProxy from '../helpers/proxyLoader';

let ImapIcal;
let imapClient;

test.before(t => {
  return loadFixtures(test);
});

test('should list available mailboxes', t => {
  const mailboxes = test.fixtures['listMailboxes'];

  ImapIcal = loadProxy(ImapClient, (_imapClient) => {
    imapClient = _imapClient;
    sinon.stub(imapClient, 'connect');
    sinon.stub(imapClient, 'listMailboxes');

    imapClient.connect.returns(Promise.resolve());
    imapClient.listMailboxes.returns(Promise.resolve(mailboxes));
  });

  const imapical = new ImapIcal({});

  const testPromise = imapical.listMailboxes().then((fetchedMailboxes) => {
    t.is(fetchedMailboxes.length, mailboxes.children.length);
  });

  return testPromise;
});
