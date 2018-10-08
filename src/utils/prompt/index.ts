import inquirer, { prompt, Question as OriginQuestion, Answers } from 'inquirer'
import AutocompletePrompt from './autocomplete.js'

type BasicQuestion<T = Answers> = {
    name: string
    message: string | ((answers: T) => string)
} & OriginQuestion

type AutoList =  {
    type: 'autolist'
    source: string[],
    filterTimeout?: number,
    filterStrategy?: (input, source) => string[]
} & BasicQuestion

type Input =  {
    type?: 'input'
} & BasicQuestion

type Confirm =  {
    type: 'confirm'
} & BasicQuestion

type List =  {
    type: 'list'
} & BasicQuestion

type RawList =  {
    type: 'rawlist'
} & BasicQuestion

type Expand =  {
    type: 'expand'
} & BasicQuestion

type Checkbox =  {
    type: 'checkbox'
} & BasicQuestion

type Password =  {
    type: 'password'
} & BasicQuestion

type Editor =  {
    type: 'autolist'
} & BasicQuestion

type NewQuestion =  AutoList |
                    Input |
                    Confirm |
                    List |
                    RawList |
                    Expand |
                    Checkbox |
                    Password |
                    Editor

export default (questions: (NewQuestion)[]) => {
    inquirer.registerPrompt('autolist', AutocompletePrompt)
    return prompt(questions)
}
