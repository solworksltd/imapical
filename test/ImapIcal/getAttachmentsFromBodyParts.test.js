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

test('should return the correct amount of attachments', t => {
  const messagePart = test.fixtures['listMessages-PART'];
  const bodyStructures = test.fixtures['messageBodyStructure'];
  const { bodystructure } = bodyStructures[1];
  const { childNodes } = bodystructure;

  const client = {
    listMessages: sinon.stub().returns(Promise.resolve(messagePart)),
    mailbox: faker.random.word(),
  };

  const clientsWithMessageBodyParts = [
    {
      client,
      messagesWithBodyParts: [
        {
          message: {},
          bodyParts: childNodes[2],
        },
        {
          message: {},
          bodyParts: childNodes[2],
        },
        {
          message: {},
          bodyParts: childNodes[2],
        }
      ]
    }
  ];

  const imapical = new ImapIcal({});

  return imapical.getAttachmentsFromBodyParts(clientsWithMessageBodyParts).then((attachments) => {
    t.is(attachments.length, clientsWithMessageBodyParts[0].messagesWithBodyParts.length);
  });
});


test('should return the message the attachment is from', t => {
  const messagePart = test.fixtures['listMessages-PART'];
  const bodyStructures = test.fixtures['messageBodyStructure'];
  const { bodystructure } = bodyStructures[1];
  const { childNodes } = bodystructure;

  const client = {
    listMessages: sinon.stub().returns(Promise.resolve(messagePart)),
    mailbox: faker.random.word(),
  };

  const clientsWithMessageBodyParts = [
    {
      client,
      messagesWithBodyParts: [
        {
          message: faker.random.objectElement(),
          bodyParts: childNodes[2],
        },
      ]
    }
  ];

  const imapical = new ImapIcal({});

  return imapical.getAttachmentsFromBodyParts(clientsWithMessageBodyParts).then((attachments) => {
    const messageAndAttachment = attachments[0];

    t.is(messageAndAttachment.message, clientsWithMessageBodyParts[0].messagesWithBodyParts[0].message);
  });
});


test('should return a decoded attachment', t => {
  const messagePart = test.fixtures['listMessages-PART'];
  const bodyStructures = test.fixtures['messageBodyStructure'];
  const { bodystructure } = bodyStructures[1];
  const { childNodes } = bodystructure;

  const client = {
    listMessages: sinon.stub().returns(Promise.resolve(messagePart)),
    mailbox: faker.random.word(),
  };

  const clientsWithMessageBodyParts = [
    {
      client,
      messagesWithBodyParts: [
        {
          message: {},
          bodyParts: childNodes[2],
        },
      ]
    }
  ];

  const imapical = new ImapIcal({});

  return imapical.getAttachmentsFromBodyParts(clientsWithMessageBodyParts).then((attachments) => {
    const messageAndAttachment = attachments[0];

    t.true(messageAndAttachment.attachment.includes('BEGIN:VCALENDAR'));
  });
});
