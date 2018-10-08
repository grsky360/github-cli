import client,  { loginRequired, filterFields } from '../utils/GithubApi'
import prompt from '../utils/prompt'
import { autobind } from 'core-decorators'
import { ReposGetResponse } from '@octokit/rest';

class RepoAction {

    @loginRequired.check()
    async getList(fields: (keyof(ReposGetResponse))[] = []) {
        let results: ReposGetResponse[] = (await client.repos.getAll({})).data
        return filterFields(results, fields)
    }

    @loginRequired.check()
    async create() {
        let { repoName, isPrivate, description }: any = await prompt([
            {
                type: 'input',
                name: 'repoName',
                message: 'New repository name: ',
                validate: inp => !!inp
            },
            {
                name: 'isPrivate',
                message: 'Is private: ',
                type: 'confirm',
                default: false
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description: '
            }
        ])
        let { data: { full_name, name, html_url, ssh_url, clone_url } }: any = await client.repos.create({
            name: repoName,
            private: isPrivate,
            description: description
        })
        console.log({full_name, name, html_url, ssh_url, clone_url})
    }

    @loginRequired.check()
    async delete(repo: string) {
        let username = loginRequired.username()
        await client.repos.delete({
            owner: username,
            repo
        })
    }
}

@autobind
class Repo {
    action = new RepoAction()

    async list() {
        let outputArray = await this.action.getList(['id', 'private', 'name'])
        outputArray.map(map => {
            console.log(map)
        })
    }

    create() {
        this.action.create()
    }

    async delete() {
        let list = await this.action.getList(['name'])
        let { repo, confirmed } = await prompt([
            {
                type: 'autolist',
                name: 'repo',
                message: 'Repositorys: ',
                source: list.map(item => item.name)
            },
            {
                type: 'confirm',
                name: 'confirmed',
                message: answers => `Do you realy want to delete this repository(${answers.repo}): '`,
                default: false
            }
        ])
        if (confirmed) {
            this.action.delete(repo)
        }
    }

    async info() {
        let list = await this.action.getList(['name', 'full_name'])
        let { repo } = await prompt([
            {
                type: 'autolist',
                name: 'repo',
                message: 'Repositorys: ',
                source: list.map(item => item.name)
            }
        ])
        let result = list.find(item => item.name === repo)
        console.log(result)
    }
}

const repo = new Repo()
export default repo
