import ImapIcal from './ImapIcal';

export default (opts) => {
  if (!opts) {
    throw new Error('Configuration expected');
  }

  return new ImapIcal(opts);
}