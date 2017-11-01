import test from 'ava';
import faker from 'faker';

import imapical from '../src';
import ImapIcal from '../src/ImapIcal';

test('throw an error if no configuration is passed', t => {
	t.throws(() => {
		imapical();
	}, /Configuration expected/);
});

test('does not throw an error if valid configuration is passed', t => {
  t.notThrows(() => {
    imapical({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      host: faker.internet.domainName(),
    });
  });
});

test('provides an instance of ImapIcal', t => {
  const iical = imapical({
    username: faker.internet.userName(),
    password: faker.internet.password(),
    host: faker.internet.domainName(),
  });

  t.true(iical instanceof ImapIcal);
});