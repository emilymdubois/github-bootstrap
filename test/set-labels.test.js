'use strict';

const file = require(`${__dirname}/../lib/set-labels`);
const sinon = require('sinon');
const test = require('tape');

const error = 'some error message';
const success = 'some success message';

test('[set-labels] [validate]', (t) => {
  const owner = 'some-owner';
  const repo = 'some-repo';
  const token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const config = { labels: { feature: '#000' } };

  t.test('[set-labels] [validate] no options.owner', (assert) => {
    file.validate({ repo: repo, token: token, config: config }, (err) => {
      assert.equal(err, 'owner is required', 'should return error regarding owner requirement');
      assert.end();
    });
  });

  t.test('[set-labels] [validate] no options.repo', (assert) => {
    file.validate({ owner: owner, token: token, config: config }, (err) => {
      assert.deepEqual(err, 'repo is required', 'should return error regarding repo requirement');
      assert.end();
    });
  });

  t.test('[set-labels] [validate] no options.token or process.env.GitHubAccessToken', (assert) => {
    file.validate({ owner: owner, repo: repo, config: config }, (err) => {
      assert.deepEqual(err, '--token or process.env.GitHubAccessToken is required', 'should return error regarding token requirement');
      assert.end();
    });
  });

  t.test('[set-labels] [validate] no options.config or config file', (assert) => {
    file.validate({ owner: owner, repo: repo, token: token }, (err) => {
      assert.deepEqual(err, 'options.config or config.json file in github-bootstrap root is required', 'should return error regarding config requirement');
      assert.end();
    });
  });

  t.test('[set-labels] [validate] success', (assert) => {
    file.validate({ owner: owner, repo: repo, token: token, config: config }, (err, res) => {
      assert.ifError(err, 'should not error');
      assert.deepEqual(res, {
        owner: owner,
        repo: repo,
        token: token,
        config: config
      }, 'should return expected object');
      assert.end();
    });
  });

  t.end();
});

test('[set-labels] [getLabels]', (t) => {
  const owner = 'some-owner';
  const repo = 'some-repo';
  const token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  t.test('[set-labels] [getLabels] error', (assert) => {
    const stub = sinon.stub(file, 'callApi').yields(error);
    file.getLabels({ owner: owner, repo: repo, token: token }, (err) => {
      assert.deepEqual(stub.getCall(0).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels`, method: 'GET', user_agent: owner, access_token: token }, 'file.callApi should accept expected parameters');
      assert.deepEqual(err, error, 'should return error from file.callApi invocation');
      file.callApi.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [getLabels] success', (assert) => {
    const stub = sinon.stub(file, 'callApi').yields(null, success);
    file.getLabels({ owner: owner, repo: repo, token: token }, (err, res) => {
      assert.deepEqual(stub.getCall(0).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels`, method: 'GET', user_agent: owner, access_token: token }, 'file.callApi should accept expected parameters');
      assert.ifError(err, 'should not error');
      assert.deepEqual(res, success, 'should return response from file.callApi invocation');
      file.callApi.restore();
      assert.end();
    });
  });

  t.end();
});

test('[set-labels] [deleteLabels]', (t) => {
  const owner = 'some-owner';
  const repo = 'some-repo';
  const existing = [{ name: 'some-label' }, { name: 'another-label' }];
  const token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  t.test('[set-labels] [deleteLabels] error', (assert) => {
    const stub = sinon.stub(file, 'callApi').yields(error);
    file.deleteLabels({ owner: owner, repo: repo, existing: existing, token: token }, (err) => {
      assert.deepEqual(stub.getCall(0).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels/some-label`, method: 'DELETE', user_agent: owner, access_token: token }, 'file.callApi should accept expected parameters');
      assert.deepEqual(err, error, 'should return error from file.callApi invocation');
      file.callApi.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [deleteLabels] success', (assert) => {
    const stub = sinon.stub(file, 'callApi').yields(null, success);
    file.deleteLabels({ owner: owner, repo: repo, existing: existing, token: token }, (err, res) => {
      assert.deepEqual(stub.getCall(0).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels/some-label`, method: 'DELETE', user_agent: owner, access_token: token }, '[1/2] file.callApi should accept expected parameters');
      assert.deepEqual(stub.getCall(1).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels/another-label`, method: 'DELETE', user_agent: owner, access_token: token }, '[2/2] file.callApi should accept expected parameters');
      assert.ifError(err, 'should not error');
      assert.deepEqual(res, Array(2).fill(success), 'should return responses from file.callApi invocations');
      file.callApi.restore();
      assert.end();
    });
  });

  t.end();
});

test('[set-labels] [putLabels]', (t) => {
  const owner = 'some-owner';
  const repo = 'some-repo';
  const token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const config = { labels: { feature: '#000', bug: '#fff' } };

  t.test('[set-labels] [putLabels] error', (assert) => {
    const stub = sinon.stub(file, 'callApi').yields(error);
    file.putLabels({ config: config, owner: owner, repo: repo, token: token }, (err) => {
      assert.deepEqual(stub.getCall(0).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels`, method: 'POST', user_agent: owner, access_token: token, body: JSON.stringify({ name: 'feature', color: '000' }) }, 'file.callApi should accept expected parameters');
      assert.deepEqual(err, error, 'should return error from file.callApi invocation');
      file.callApi.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [putLabels] success', (assert) => {
    const stub = sinon.stub(file, 'callApi').yields(null, success);
    file.putLabels({ config: config, owner: owner, repo: repo, token: token }, (err, res) => {
      assert.deepEqual(stub.getCall(0).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels`, method: 'POST', user_agent: owner, access_token: token, body: JSON.stringify({ name: 'feature', color: '000' }) }, '[1/2] file.callApi should accept expected parameters');
      assert.deepEqual(stub.getCall(1).args[0], { url: `https://api.github.com/repos/${owner}/${repo}/labels`, method: 'POST', user_agent: owner, access_token: token, body: JSON.stringify({ name: 'bug', color: 'fff' }) }, '[2/2] file.callApi should accept expected parameters');
      assert.ifError(err, 'should not error');
      assert.deepEqual(res, Array(2).fill(success), 'should return responses from file.callApi invocations');
      file.callApi.restore();
      assert.end();
    });
  });

  t.end();
});

test('[set-labels] [callApi]', (t) => {
  const method = 'POST';
  const url = 'https://api.github.com/repos/some-owner/some-repo/labels';
  const user_agent = 'some-owner';
  const access_token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const body = JSON.stringify({ name: 'feature', color: '000' });

  t.test('[set-labels] [callApi] error', (assert) => {
    const stub = sinon.stub(file, 'request').yields(error);
    file.callApi({ method: method, url: url, user_agent: user_agent, access_token: access_token, body: body }, (err) => {
      assert.deepEqual(stub.getCall(0).args[0], { method: method, url: url, headers: { 'User-Agent': user_agent, Authorization: `token ${access_token}` }, body: body }, 'file.request should accept expected parameters');
      assert.deepEqual(err, error, 'should return error from file.request invocation');
      file.request.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [callApi] >299 status code', (assert) => {
    const stub = sinon.stub(file, 'request').yields(null, { statusCode: 404 }, JSON.stringify({ message: 'some message' }));
    file.callApi({ method: method, url: url, user_agent: user_agent, access_token: access_token, body: body }, (err) => {
      assert.deepEqual(stub.getCall(0).args[0], { method: method, url: url, headers: { 'User-Agent': user_agent, Authorization: `token ${access_token}` }, body: body }, 'file.request should accept expected parameters');
      assert.deepEqual(err, 'HTTP status code 404: some message', 'should return HTTP status code error from file.request invocation');
      file.request.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [callApi] 204 status code', (assert) => {
    const stub = sinon.stub(file, 'request').yields(null, { statusCode: 204 });
    file.callApi({ method: method, url: url, user_agent: user_agent, access_token: access_token, body: body }, (err, res) => {
      assert.deepEqual(stub.getCall(0).args[0], { method: method, url: url, headers: { 'User-Agent': user_agent, Authorization: `token ${access_token}` }, body: body }, 'file.request should accept expected parameters');
      assert.ifError(err, 'should not error');
      assert.ok(!res, 'should not return response content for a 204 status code');
      file.request.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [callApi] 200 status code, non-JSON response', (assert) => {
    const stub = sinon.stub(file, 'request').yields(null, { statusCode: 200 }, undefined);
    file.callApi({ method: method, url: url, user_agent: user_agent, access_token: access_token, body: body }, (err) => {
      assert.deepEqual(stub.getCall(0).args[0], { method: method, url: url, headers: { 'User-Agent': user_agent, Authorization: `token ${access_token}` }, body: body }, 'file.request should accept expected parameters');
      assert.deepEqual(err.toString(), 'SyntaxError: Unexpected token u', 'should return error from call.request invocation');
      file.request.restore();
      assert.end();
    });
  });

  t.test('[set-labels] [callApi] 200 status code, JSON response', (assert) => {
    const stub = sinon.stub(file, 'request').yields(null, { statusCode: 200 }, JSON.stringify({ message: 'some message' }));
    file.callApi({ method: method, url: url, user_agent: user_agent, access_token: access_token, body: body }, (err, res) => {
      assert.deepEqual(stub.getCall(0).args[0], { method: method, url: url, headers: { 'User-Agent': user_agent, Authorization: `token ${access_token}` }, body: body }, 'file.request should accept expected parameters');
      assert.ifError(err, 'should not error');
      assert.deepEqual(res, { message: 'some message' }, 'should return reponse from file.request invocation');
      file.request.restore();
      assert.end();
    });
  });

  t.end();
});
