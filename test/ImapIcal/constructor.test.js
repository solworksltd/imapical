import test from 'ava';
import faker from 'faker';
import ImapClient from 'emailjs-imap-client';

import ImapIcal from '../../src/ImapIcal';

test('creates new instance of emailjs-imap-client', t => {
	const imapical = new ImapIcal({
    host: faker.internet.domainName(),
  });

  t.truthy(imapical.mailboxBrowser);
  t.true(imapical.mailboxBrowser instanceof ImapClient);
});

test('creates an empty array of mailbox clients', t => {
	const imapical = new ImapIcal({
    host: faker.internet.domainName(),
  });

  t.truthy(imapical.clients);
  t.true(imapical.clients.length === 0);
});
