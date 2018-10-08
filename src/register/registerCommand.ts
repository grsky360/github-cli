import { default as commander, Command } from 'commander'
import { default as configs, CommandOption, HasSub, NoSub } from './config'
import Queue from '../utils/Queue'

(function() {
    commander.Command.prototype.forwardSubcommands = function() {
        var self = this;
        var listener = function(args: any, unknown: any) {
            // Parse any so-far unknown options
            args = args || [];
            unknown = unknown || [];

            var parsed = self.parseOptions(unknown);
            if (parsed.args.length) {
                args = parsed.args.concat(args);
            }
            unknown = parsed.unknown;

            // Output help if necessary
            if (unknown.includes('--help') || unknown.includes('-h')) {
                self.outputHelp();
                process.exit(0);
            }

            self.parseArgs(args, unknown);
        };

        if (this._args.length > 0) {
            console.error('forwardSubcommands cannot be applied to command with explicit args');
        }

        var parent = this.parent || this;
        var name = parent === this ? '*' : this._name;
        parent.on('command:' + name, listener);
        if (this._alias) {
            parent.on('command:' + this._alias, listener);
        }
        return this;
    };
})()

export default () => {
    let { version, description, commandOptions } = configs
    commander.version(version)
    commander.description(description)
    type CC = {
        parent: Command
        subs: Array<CommandOption>
    }
    let subcommands: Queue<CC> = new Queue()
    subcommands.push({
        parent: commander,
        subs: commandOptions ? new Array(...commandOptions) : new Array()
    })
    while (!subcommands.empty()) {
        let subcommand = subcommands.pop()
        if (!subcommand) { continue }
        let { parent, subs } = subcommand
        subs.map((option: CommandOption) => {
            let { command, description, alias } = option
            let c = parent.command(command)
            if (description) {
                c.description(description)
            }
            if (alias) {
                c.alias(alias)
            }
            if (option.hasSub) {
                let scs = (<HasSub>option).subCommands
                if (scs && scs.length) {
                    subcommands.push({
                        parent: c.forwardSubcommands(),
                        subs: scs
                    })
                }
            } else {
                c.action((<NoSub>option).action)
            }
        })
    }
    
    commander.parse(process.argv)
}
