import commander, { Command } from 'commander'
import user from '../commands/User'
import repo from '../commands/Repo'
import search from '../commands/Search'

export type CommandOption = HasSub | NoSub
export type BasicCommandOption = {
    command: string
    description?: string
    alias?: string
}
export type HasSub = {
    hasSub: true
    subCommands: CommandOption[]
} & BasicCommandOption
export type NoSub = {
    hasSub: false
    action: (...args: any[]) => void
} & BasicCommandOption

const commandOptions: CommandOption[] = [
    {
        command: 'help',
        description: 'help',
        hasSub: false,
        action: (name) => {
            let commands: Command[] = commander.commands
            let command = commands.find(c => c._name === name)
            if (!command) {
                command = commander
            }
            command.outputHelp()
            process.exit()
        }
    },
    {
        command: 'login',
        description: 'login',
        hasSub: false,
        action: user.login
    },
    {
        command: 'logout',
        description: 'logout',
        hasSub: false,
        action: user.logout
    },
    {
        command: 'repo',
        description: 'repo',
        hasSub: true,
        subCommands: [
            {
                command: 'list',
                description: 'list',
                hasSub: false,
                action: repo.list
            },
            {
                command: 'create',
                description: 'create',
                hasSub: false,
                action: repo.create
            },
            {
                command: 'delete',
                description: 'delete',
                hasSub: false,
                action: repo.delete
            },
            {
                command: 'info',
                description: 'info',
                hasSub: false,
                action: repo.info
            }
        ]
    },
    {
        command: 'search',
        description: 'search',
        hasSub: true,
        subCommands: [
            {
                command: 'user',
                description: 'user',
                hasSub: false,
                action: search.user
            },
            {
                command: 'repo',
                description: 'repository',
                hasSub: false,
                action: search.repo
            }
        ]
    },
    {
        command: 'test1',
        hasSub: true,
        subCommands: [
            {
                command: 'test2',
                hasSub: true,
                subCommands: [
                    {
                        command: 'test3',
                        hasSub: true,
                        subCommands: [
                            {
                                command: 'test4',
                                hasSub: false,
                                action: () => {
                                    console.log('test1234')
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

export default {
    version: '0.0.1',
    description: 'github-cli',
    commandOptions: commandOptions
}
