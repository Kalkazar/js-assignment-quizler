'use strict';

var _vorpal = require('vorpal');

var _vorpal2 = _interopRequireDefault(_vorpal);

var _inquirer = require('inquirer');

var _lib = require('./lib');

var _fs = require('fs');

var _jsverify = require('jsverify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cli = (0, _vorpal2.default)();

const askForQuestions = [{
  type: 'input',
  name: 'numQuestions',
  message: 'How many questions do you want in your quiz?',
  validate: input => {
    const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/);
    return pass ? true : 'Please enter a valid number!';
  }
}, {
  type: 'input',
  name: 'numChoices',
  message: 'How many choices should each question have?',
  validate: input => {
    const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/);
    return pass ? true : 'Please enter a valid number!';
  }
}];

const readFilePromise = fileName => new Promise((resolve, reject) => {
  (0, _fs.readFile)("./lib/quizzes/" + fileName + ".json", (err, data) => {
    if (err) {
      console.log("Failed to read file");
      console.log(err);
      reject(err); // does this even do anything?
    }
    console.log('File read successfully');
    console.log(data);
    resolve(data); // does this even do anything?
  });
});

const writeFilePromise = (fileName, data) => new Promise((resolve, reject) => {
  (0, _fs.writeFile)("./lib/ungraded/" + fileName + ".json", data, err => {
    if (err) {
      console.log("Failed to create file");
      console.log(err);
      reject(err); // does this even do anything?
    }
    console.log('File saved successfully');
    console.log(data);
    resolve(data); // does this even do anything?
  });
});

// // UNTESTED
const readdirPromise = //quizzes =>
new Promise((resolve, reject) => {
  (0, _fs.readdir)('./lib/quizzes/', (err, files) => {
    if (err) {
      console.log('ERROR: could not find the quizzes file');
      reject(err);
    }
    console.log(files);
    resolve(files);
  });
});

const createQuiz = title => (0, _inquirer.prompt)(askForQuestions).then(promptInput => (0, _inquirer.prompt)((0, _lib.createPrompt)(promptInput))).then(questionInput => (0, _lib.createQuestions)(questionInput)).then(quiz => writeFilePromise(title, JSON.stringify(quiz))).catch(err => console.log('Error creating the quiz.', err));

const parseJSONData = data => JSON.parse(data);

const takeQuiz = (title, output) => readFilePromise(title).then(parseJSONData).then(parsedInput => (0, _inquirer.prompt)(parsedInput)).then(answers => writeFilePromise(output, JSON.stringify(answers))).catch(err => console.log('Error taking or retrieving quiz', err));

const combineObjects = data => {};

// TODO implement takeRandomQuiz
// CHECK IF THE FILE EXISTS
const takeRandomQuiz = (quizzes, output, n) => Promise.all(quizzes.map(quiz => readFilePromise(quiz).then(parseJSONData))).then(quizArray => quizArray.reduce((thisQuiz, thatQuiz) => thisQuiz.concat(thatQuiz))).then(questionArray => (0, _lib.chooseRandom)(questionArray, n)).then(randomQuestions => (0, _inquirer.prompt)(randomQuestions)).then(answers => writeFilePromise(output, JSON.stringify(answers)))
//.then(answer => console.log(answer))
.catch(err => console.log('Error taking or retrieving random quiz', err));

cli.command('create <fileName>', 'Creates a new quiz and saves it to the given fileName').action(function (input, callback) {
  // TODO update create command for correct functionality
  //createQuiz(input.fileName)
  // WHAT YOU DO: either return a promise or call the callback
  //   - callback is from vorpal
  return createQuiz(input.fileName); // original placeholder
  // should this even be "return?"
});

cli.command('take <fileName> <outputFile>', 'Loads a quiz and saves the users answers to the given outputFile').action(function (input, callback) {
  // TODO implement functionality for taking a quiz
  return takeQuiz(input.fileName, input.outputFile);
});

cli.command('random <outputFile> <fileNames...>', 'Loads a quiz or' + ' multiple quizes and selects a random number of questions from each quiz.' + ' Then, saves the users answers to the given outputFile').action(function (input, callback) {
  // TODO implement the functionality for taking a random quiz
  return takeRandomQuiz(input.fileNames, input.outputFile);
});

cli.delimiter(cli.chalk['yellow']('quizler>')).show();