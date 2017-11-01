import proxyquire from 'proxyquire';

export default function loadProxy(proxy, callback) {
  class Proxyquired {
    constructor(host, port, options) {
      const imapClient = new proxy(host, port, options);
      imapClient.logLevel = imapClient.LOG_LEVEL_NONE;

      callback(imapClient);

      return imapClient;
    }
  };

  const proxyquired = proxyquire('../../src/ImapIcal', {
    'emailjs-imap-client': Proxyquired,
  }).default;

  return proxyquired;
};
