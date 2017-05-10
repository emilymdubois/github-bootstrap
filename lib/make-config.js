'use strict';

const filename = 'config.json';
const fs = require('fs');
const inquirer = require('inquirer');

module.exports = (options, callback) => {
  fileDoesNotExist(filename, (err) => {
    if (err) return callback(new Error(err));
    questionnaire((answers) => {
      const labels = makeJson(answers);
      makeFile(filename, labels, (err) => {
        if (err) return callback(new Error(err));
        return callback(null, `Successfully created a ${filename} file!`);
      });
    });
  });
};

module.exports.fileDoesNotExist = fileDoesNotExist;
function fileDoesNotExist(filename, callback) {
  fs.stat(`${__dirname}/../${filename}`, (err) => {
    if (err) return callback();
    inquirer.prompt([{
      name: 'OverrideConfig',
      type: 'confirm',
      default: false,
      message: `${filename} already exists in root directory. Would you like to proceed and override ${filename}?`
    }]).then((answer) => {
      if (!answer.OverrideConfig) return callback('Aborted!');
      return callback();
    });
  });
}

module.exports.questionnaire = questionnaire;
function questionnaire(callback) {
  inquirer.prompt([{
    name: 'NumberLabels',
    type: 'input',
    message: 'How many labels would you like to configure?',
    filter: Number
  }]).then((answers0) => {
    const questions = [];
    for (let i = 1; i < answers0.NumberLabels + 1; i++) {
      questions.push({
        name: `Label${i}Name`,
        type: 'input',
        message: `Label ${i} name:`
      });
      questions.push({
        name: `Label${i}Value`,
        type: 'input',
        message: `Label ${i} hex value:`,
        validate: (input) => {
          return /^#?[a-fA-F0-9]{3,6}$/.test(input);
        }
      });
    }
    inquirer.prompt(questions).then((answers1) => {
      answers1.count = answers0.NumberLabels;
      return callback(answers1);
    });
  });
}

module.exports.makeJson = makeJson;
function makeJson(answers) {
  const json = { labels: {} };
  for (let i = 1; i < answers.count + 1; i++) {
    const key = answers[`Label${i}Name`];
    const value = (/^#.*$/.test(answers[`Label${i}Value`])) ? answers[`Label${i}Value`] : `#${answers[`Label${i}Value`]}`;
    json.labels[key] = value;
  }
  return json;
}

module.exports.makeFile = makeFile;
function makeFile(filename, labels, callback) {
  fs.writeFile(`${__dirname}/../${filename}`, JSON.stringify(labels, null, 2), callback);
}
