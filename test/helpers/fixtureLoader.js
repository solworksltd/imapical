import fs from 'fs';
import path from 'path';

const fixturesPath = path.resolve('./test/fixtures');

function loadFixture(fixture) {
  return new Promise((resolve, reject) => {
    const name = fixture.slice(0, -5);
    const fixturePath = path.join(fixturesPath, fixture);

    fs.readFile(fixturePath, (err, data) => {
      if (err) {
        return reject(err);
      }

      try {
        const json = JSON.parse(data);

        return resolve({
          name,
          fixture: json,
        });
      } catch(err) {
        return reject(err);
      }
    });
  })
}

export default function loadFixtures(test) {
  return new Promise((resolve, reject) => {
    fs.readdir(fixturesPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      const fixtures = files.filter((file) => { return file.substr(-4) === 'json'; });

      Promise.all(fixtures.map((fixture) => {
        return loadFixture(fixture);
      })).then((loadedFixtures) => {
        test.fixtures = {};

        loadedFixtures.forEach((loadedFixture) => {
          test.fixtures[loadedFixture.name] = loadedFixture.fixture;
        });

        return resolve();
      });
    });
  })
}
