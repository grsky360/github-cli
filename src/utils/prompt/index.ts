import inquirer, { prompt, Question } from 'inquirer'
import AutocompletePrompt from './autocomplete.js'

type NewQuestion = Question & {
    type?: 'autolist' | 'input' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor'
    name: string
    source?
}

export default (questions: NewQuestion[]) => {
    inquirer.registerPrompt('autolist', AutocompletePrompt)
    return prompt(questions)
}
