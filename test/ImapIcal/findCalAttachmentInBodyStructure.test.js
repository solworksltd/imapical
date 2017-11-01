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

test('should handle case when bodyStructure has child nodes', t => {
  const bodyStructures = test.fixtures['messageBodyStructure'];
  const { bodystructure } = bodyStructures[1];

  const imapical = new ImapIcal({});

  const nodeWithCalAttachment = imapical.findCalAttachmentInBodyStructure(bodystructure);
  t.is(nodeWithCalAttachment.type, 'text/calendar');
});

test('should handle case when bodyStructure is the only node', t => {
  const bodyStructures = test.fixtures['messageBodyStructure'];
  const { bodystructure } = bodyStructures[0];

  const imapical = new ImapIcal({});

  const nodeWithCalAttachment = imapical.findCalAttachmentInBodyStructure(bodystructure);
  t.is(nodeWithCalAttachment.type, 'text/calendar');
});
