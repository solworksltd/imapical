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

test('should request only unseen mails', t => {
  const client1 = {
    search: sinon.stub().returns(Promise.resolve()),
  };

  const imapical = new ImapIcal({});
  imapical.clients = [client1];

  const testPromise = imapical.searchUnseenMails().then(() => {
    t.true(client1.search.calledWith(sinon.match.any, { unseen: true }));
  });

  return testPromise;
});

test('should search across every mailbox client', t => {
  const client1 = {
    search: sinon.stub().returns(Promise.resolve()),
  };
  const client2 = {
    search: sinon.stub().returns(Promise.resolve()),
  };
  const client3 = {
    search: sinon.stub().returns(Promise.resolve()),
  };

  const imapical = new ImapIcal({});
  imapical.clients = [client1, client2, client3];

  const testPromise = imapical.searchUnseenMails().then(() => {
    t.true(client1.search.called);
    t.true(client2.search.called);
    t.true(client3.search.called);
  });

  return testPromise;
});

test('should return the client who provided the search results', t => {
  const searchResults = test.fixtures['search'];

  const client1 = {
    search: sinon.stub().returns(Promise.resolve(searchResults)),
  };
  const client2 = {
    search: sinon.stub().returns(Promise.resolve(searchResults)),
  };
  const client3 = {
    search: sinon.stub().returns(Promise.resolve(searchResults)),
  };

  const imapical = new ImapIcal({});
  imapical.clients = [client1, client2, client3];

  const testPromise = imapical.searchUnseenMails().then((clientSearchResults) => {
    t.is(clientSearchResults[0].client, client1);
    t.is(clientSearchResults[1].client, client2);
    t.is(clientSearchResults[2].client, client3);
  });

  return testPromise;
});

test('should return the correct search results for each mailbox', t => {
  const searchResults = test.fixtures['search'];
  const searchResults1 = searchResults.concat([faker.random.number()]);
  const searchResults2 = searchResults.concat([faker.random.number()]);
  const searchResults3 = searchResults.concat([faker.random.number()]);

  const client1 = {
    search: sinon.stub().returns(Promise.resolve(searchResults1)),
  };
  const client2 = {
    search: sinon.stub().returns(Promise.resolve(searchResults2)),
  };
  const client3 = {
    search: sinon.stub().returns(Promise.resolve(searchResults3)),
  };

  const imapical = new ImapIcal({});
  imapical.clients = [client1, client2, client3];

  const testPromise = imapical.searchUnseenMails().then((clientSearchResults) => {
    t.is(clientSearchResults[0].searchResults, searchResults1);
    t.is(clientSearchResults[1].searchResults, searchResults2);
    t.is(clientSearchResults[2].searchResults, searchResults3);
  });

  return testPromise;
});

test('should provide the correct mailbox name to search', t => {
  const client1 = {
    search: sinon.stub().returns(Promise.resolve()),
    mailbox: faker.random.word(),
  };
  const client2 = {
    search: sinon.stub().returns(Promise.resolve()),
    mailbox: faker.random.word(),
  };
  const client3 = {
    search: sinon.stub().returns(Promise.resolve()),
    mailbox: faker.random.word(),
  };

  const imapical = new ImapIcal({});
  imapical.clients = [client1, client2, client3];

  const testPromise = imapical.searchUnseenMails().then(() => {
    t.true(client1.search.calledWith(client1.mailbox));
    t.true(client2.search.calledWith(client2.mailbox));
    t.true(client3.search.calledWith(client3.mailbox));
  });

  return testPromise;
});
