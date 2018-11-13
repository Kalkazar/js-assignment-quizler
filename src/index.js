import vorpal from 'vorpal'
import { prompt } from 'inquirer'

import {
  chooseRandom,
  createPrompt,
  createQuestions
} from './lib'

import { readFile, writeFile } from 'fs'

const cli = vorpal()

const askForQuestions = [
  {
    type: 'input',
    name: 'numQuestions',
    message: 'How many questions do you want in your quiz?',
    validate: input => {
      const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/)
      return pass ? true : 'Please enter a valid number!'
    }
  },
  {
    type: 'input',
    name: 'numChoices',
    message: 'How many choices should each question have?',
    validate: input => {
      const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/)
      return pass ? true : 'Please enter a valid number!'
    }
  }
]

const readFilePromise = fileName =>
  new Promise((resolve, reject) => {
    readFile("./lib/quizzes/" + fileName + ".json", (err, data) => {
      if (err) {
        console.log("Failed to read file")
        console.log(err)
        reject(err)
      }
      console.log('File read successfully')
      console.log(data)
      resolve(data)
    })
  })

const writeFilePromise = (fileName, data) =>
  new Promise((resolve, reject) => {
    writeFile("./lib/ungraded/" + fileName + ".json", data, err => {
      if (err) {
        console.log("Failed to create file")
        console.log(err)
        reject(err)
      }
      console.log('File saved successfully')
      console.log(data)
      resolve(data)
    })
  })

const createQuiz = title =>
  prompt(askForQuestions)
    .then(promptInput => prompt(createPrompt(promptInput)))
    .then(questionInput => createQuestions(questionInput))
    .then(quiz => writeFilePromise(title, JSON.stringify(quiz)))
    .catch(err => console.log('Error creating the quiz.', err))

const parseJSONData = data => JSON.parse(data)

const takeQuiz = (title, output) =>
  readFilePromise(title)
    .then(parseJSONData)
    .then(parsedInput => prompt(parsedInput))
    .then(answers => writeFilePromise(output, JSON.stringify(answers)))
    .catch(err => console.log('Error taking or retrieving quiz', err))

const takeRandomQuiz = (quizzes, output, n) =>
  Promise.all(quizzes.map(quiz => readFilePromise(quiz).then(parseJSONData)))
  .then(quizArray => quizArray.reduce((thisQuiz, thatQuiz) => thisQuiz.concat(thatQuiz)))
  .then(questionArray => chooseRandom(questionArray, n))
  .then(randomQuestions => prompt(randomQuestions))
  .then(answers => writeFilePromise(output, JSON.stringify(answers)))
  .catch(err => console.log('Error taking or retrieving random quiz', err))

cli
  .command(
    'create <fileName>',
    'Creates a new quiz and saves it to the given fileName'
  )
  .action(function (input, callback) {
    return createQuiz(input.fileName)
  })

cli
  .command(
    'take <fileName> <outputFile>',
    'Loads a quiz and saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    return takeQuiz(input.fileName, input.outputFile)
  })

cli
  .command(
    'random <outputFile> <fileNames...>',
    'Loads a quiz or' +
      ' multiple quizes and selects a random number of questions from each quiz.' +
      ' Then, saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    return takeRandomQuiz(input.fileNames, input.outputFile)
  })

cli.delimiter(cli.chalk['yellow']('quizler>')).show()
