import inquirer from 'inquirer';
import fs from 'fs-extra'
import client from '../utils/GithubApi'

type UserStore = {
    username?: string
    id?: number
    note?: string
    token?: string
}

class User {
    private readonly configFile = '.github-cli.json'
    private readonly note = 'Github-CLI'
    private readonly allScopes = ['repo', 'admin:org', 'admin:public_key', 'admin:repo_hook', 'admin:org_hook', 'gist', 'notifications', 'user', 'delete_repo', 'write:discussion', 'admin:gpg_key']

    private store = (configs?: UserStore): UserStore => {
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

    public basicAuth = async (username: string, password: string) => {
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

    public tokenAuth = (token: string) => {
        try {
            client.authenticate({
                type: 'oauth',
                token: token
            })
        } catch {
            this.store({})
        }
    }

    public login = async () => {
        let us = this.store()
        if (us && us.username && us.token) {
             this.tokenAuth(us.token)
        } else {
            let { username, password }: any = await inquirer.prompt([
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
            this.basicAuth(username, password)
        }
    }

    public logout = () => {
        this.store({})
    }
}

const user = new User()
export default user
