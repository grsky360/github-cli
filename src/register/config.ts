import commander, { Command } from 'commander'
import user from '../commands/User'
import repo from '../commands/Repo'

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
                command: 'help',
                description: 'help',
                hasSub: false,
                action: () => {
                    console.log('help')
                }
            }
        ]
    }
]

export default {
    version: '0.0.1',
    description: 'github-cli',
    commandOptions: commandOptions
}
