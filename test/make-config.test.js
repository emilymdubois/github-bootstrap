'use strict';

const file = require(`${__dirname}/../lib/make-config`);
const fs = require('fs');
const inquirer = require('inquirer');
const sinon = require('sinon');
const test = require('tape');

const error = 'some error';
const success = 'some success message';
const filename = 'config-test.json';
const answers = {
  Label1Name: 'bug',
  Label1Value: '#fff',
  Label2Name: 'feature',
  Label2Value: '#000',
  count: 2
};
const labels = {
  labels: {
    bug: '#fff',
    feature: '#000'
  }
};

test('[make-config] [fileDoesNotExist]', (t) => {
  const stat = sinon.stub(fs, 'stat');
  const prompt = sinon.stub(inquirer, 'prompt');

  t.test('[make-config] [fileDoesNotExist] fs.stat error', (assert) => {
    stat.onCall(0).yields(error);
    file.fileDoesNotExist(filename, (err, res) => {
      assert.ok(/^.*config-test.json$/.test(stat.getCall(0).args[0]), 'fs.stat argument should contain filename');
      assert.ifError(err || res, 'should not accept callback parameters');
      assert.end();
    });
  });

  t.test('[make-config] [fileDoesNotExist] inquirer.prompt no confirmation', (assert) => {
    stat.onCall(1).yields(null, success);
    prompt.onCall(0).returns(Promise.resolve({ OverrideConfig: false }));
    file.fileDoesNotExist(filename, (err, res) => {
      assert.ok(/^.*config-test.json$/.test(stat.getCall(1).args[0]), 'fs.stat argument should contain filename');
      assert.deepEqual(prompt.getCall(0).args[0], [{
        default: false,
        message: `${filename} already exists in root directory. Would you like to proceed and override ${filename}?`,
        name: 'OverrideConfig',
        type: 'confirm'
      }], 'inquirer.prompt argument should contain expected parameters');
      assert.equal(err, 'Aborted!', 'should abort if user does not confirm file override');
      assert.ifError(res, 'should not accept callback success parameter');
      assert.end();
    });
  });

  t.test('[make-config] [fileDoesNotExist] inquirer.prompt confirmation', (assert) => {
    stat.onCall(2).yields(null, success);
    prompt.onCall(1).returns(Promise.resolve({ OverrideConfig: true }));
    file.fileDoesNotExist(filename, (err, res) => {
      assert.ok(/^.*config-test.json$/.test(stat.getCall(1).args[0]), 'fs.stat argument should contain filename');
      assert.deepEqual(prompt.getCall(0).args[0], [{
        default: false,
        message: `${filename} already exists in root directory. Would you like to proceed and override ${filename}?`,
        name: 'OverrideConfig',
        type: 'confirm'
      }], 'inquirer.prompt argument should contain expected parameters');
      assert.ifError(err || res, 'should not accept callback parameters');
      assert.end();
    });
  });

  t.test('[make-config] [fileDoesNotExist] restore', (assert) => {
    fs.stat.restore();
    inquirer.prompt.restore();
    assert.end();
  });

  t.end();
});

test('[make-config] [questionnaire]', (t) => {
  const prompt = sinon.stub(inquirer, 'prompt');

  t.test('[make-config] [questionnaire] 2 labels', (assert) => {
    prompt.onCall(0).returns(Promise.resolve({ NumberLabels: 2 }));
    prompt.onCall(1).returns(Promise.resolve({ Label1Name: 'bug', Label1Value: '#fff', Label2Name: 'feature', Label2Value: '#000' }));
    file.questionnaire((res) => {
      /* Stringify validate functions */
      const stringified = prompt.getCall(1).args[0].map((q) => {
        if (q.validate) q.validate = q.validate.toString();
        return q;
      });

      assert.deepEqual(prompt.getCall(0).args[0], [{
        filter: Number,
        message: 'How many labels would you like to configure?',
        name: 'NumberLabels',
        type: 'input'
      }], 'inquirer.prompt argument should contain expected parameters');
      assert.deepEqual(stringified, [
        { message: 'Label 1 name:', name: 'Label1Name', type: 'input' },
        { message: 'Label 1 hex value:', name: 'Label1Value', type: 'input', validate: '(input) => {\n          return /^#?[a-fA-F0-9]{3,6}$/.test(input);\n        }' },
        { message: 'Label 2 name:', name: 'Label2Name', type: 'input' },
        { message: 'Label 2 hex value:', name: 'Label2Value', type: 'input', validate: '(input) => {\n          return /^#?[a-fA-F0-9]{3,6}$/.test(input);\n        }' }
      ], 'inquirer.prompt argument should contain expected parameters');
      assert.deepEqual(res, answers, 'should return expected response');
      assert.end();
    });
  });

  t.test('[make-config] [questionnaire] restore', (assert) => {
    inquirer.prompt.restore();
    assert.end();
  });

  t.end();
});

test('[make-config] [makeJson]', (t) => {
  const result = file.makeJson(answers);
  t.deepEqual(result, labels, 'should return expected JSON object');
  t.end();
});

test('[make-config] [makeFile]', (t) => {
  const writeFile = sinon.stub(fs, 'writeFile');

  t.test('[make-config] [makeFile] error', (assert) => {
    writeFile.onCall(0).yields(error);
    file.makeFile(filename, labels, (err, res) => {
      assert.ok(/^.*config-test.json$/.test(writeFile.getCall(0).args[0]), 'fs.stat arguments should contain filename');
      assert.deepEqual(writeFile.getCall(0).args[1], JSON.stringify(labels, null, 2), 'fs.stat arguments should contain stringified labels object');
      assert.equal(err, error, 'callback should pass through fs.writeFile error');
      assert.ifError(res, 'should not accept callback success parameter');
      assert.end();
    });
  });

  t.test('[make-config] [makeFile] success', (assert) => {
    writeFile.onCall(1).yields(null, success);
    file.makeFile(filename, labels, (err, res) => {
      assert.ok(/^.*config-test.json$/.test(writeFile.getCall(1).args[0]), 'fs.stat arguments should contain filename');
      assert.deepEqual(writeFile.getCall(1).args[1], JSON.stringify(labels, null, 2), 'fs.stat arguments should contain stringified labels object');
      assert.ifError(err, 'should not error');
      assert.equal(res, success, 'should return success message');
      assert.end();
    });
  });

  t.test('[make-config] [makefile] restore', (assert) => {
    fs.writeFile.restore();
    assert.end();
  });

  t.end();
});
