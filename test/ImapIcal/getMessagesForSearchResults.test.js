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

test('should not attempt to list messages if there were no search results', t => {
  const searchResults = [{
    client: {
      listMessages: sinon.stub().returns(Promise.resolve()),
    },
    searchResults: []
  }];

  const imapical = new ImapIcal({});

  const testPromise = imapical.getMessagesForSearchResults(searchResults).then(() => {
    t.true(searchResults[0].client.listMessages.notCalled);
  });

  return testPromise;
});