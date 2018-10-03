import { prompt } from 'inquirer';
import fs from 'fs-extra'
import client from '../utils/GithubApi'
import { autobind } from 'core-decorators';

type UserStore = {
    username?: string
    id?: number
    note?: string
    token?: string
}

@autobind
class UserAction {
    readonly configFile = '.github-cli.json'
    readonly note = 'Github-CLI'
    readonly allScopes = ['repo', 'admin:org', 'admin:public_key', 'admin:repo_hook', 'admin:org_hook', 'gist', 'notifications', 'user', 'delete_repo', 'write:discussion', 'admin:gpg_key']

    store (configs?: UserStore): UserStore {
        if (configs) {
            fs.writeJSONSync(this.configFile, configs)
            return configs
        } else {
            try {
                return fs.readJSONSync(this.configFile)
            } catch {
                return this.store({})
            }
        }
    }

    async basicAuth(username: string, password: string) {
        client.authenticate({
            type: 'basic',
            username: username,
            password: password
        })
        let a = (await client.authorization.getAll({})).data.find(item => item.note === this.note)
        if (a) {
            await client.authorization.delete({
                authorization_id: '' + a.id
            })
        }
        let c = await client.authorization.create({
            note: this.note,
            scopes: this.allScopes
        })
        let aid = c.data.id
        let token = c.data.token
        this.store({
            username: username,
            id: aid,
            note: this.note,
            token: token
        })
    }
    async tokenAuth(token: string) {
        try {
            client.authenticate({
                type: 'oauth',
                token: token
            })
        } catch {
            this.store({})
        }
    }
}

@autobind
class User {
    action = new UserAction()

    async login() {
        let us = this.action.store()
        if (us && us.username && us.token) {
             this.action.tokenAuth(us.token)
        } else {
            let { username, password }: any = await prompt([
                {
                    type: 'input',
                    name: 'username',
                    message: 'Github username',
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Github password',
                }
            ])
            this.action.basicAuth(username, password)
        }
    }

    logout() {
        this.action.store({})
    }
}

const user = new User()
export default user
