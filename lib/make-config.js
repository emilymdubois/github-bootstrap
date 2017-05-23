'use strict';

const filename = 'config.json';
const fs = require('fs');
const inquirer = require('inquirer');

/**
 * A function to create a configuration file. If the configuration file already
 * exists, prompt the user to confirm they would like to override it. Then gather
 * information from the user about desired label names and associated hex values.
 * Finally, write the label information to the configuration file.
 *
 * @function run
 * @param {object} options - CLI flags
 */
module.exports = run;
function run(options, callback) {
  confirmFileCreation(filename, (err) => {
    if (err) return callback(new Error(err));
    questionnaire((answers) => {
      const labels = makeJson(answers);
      makeFile(filename, labels, (err) => {
        if (err) return callback(new Error(err));
        return callback(null, `Successfully created a ${filename} file!`);
      });
    });
  });
}

/**
 * A function to check if configuration file already exists. If so, prompt the user
 * to confirm that they would like to override it.
 *
 * @function confirmFileCreation
 * @param {string} filename
 */
module.exports.confirmFileCreation = confirmFileCreation;
function confirmFileCreation(filename, callback) {
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

/**
 * A function to ask the user how many labels they would like to create, gathering
 * label names and hex values for each.
 *
 * @function questionnaire
 */
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

/**
 * A function to create a JSON object from the questionnaire answers, where the
 * keys are the label names, and the values are the label hex values.
 *
 * @function makeJson
 * @param {object} answers - answers object returned by the `questionnaire`function
 */
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


/**
 * A function to write the object returned by the `makeJson` function to the configuration
 * file.
 *
 * @function makeFile
 * @param {string} filename
 * @param {object} labels - labels object returned by `makeJson` function
 */
module.exports.makeFile = makeFile;
function makeFile(filename, labels, callback) {
  fs.writeFile(`${__dirname}/../${filename}`, JSON.stringify(labels, null, 2), callback);
}
