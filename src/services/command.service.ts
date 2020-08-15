import fs from 'fs';
import { Message,  TextChannel } from 'discord.js';
import { Command, CommandContext } from '../commands/command';
import Log from '../utils/log';
import Deps from '../utils/deps';
import { GuildDocument } from '../data/models/guild';
import Cooldowns from './cooldowns';
import Validators from './validators';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

export default class CommandService {
    private commands = new Map<string, Command>();

    constructor(
        private cooldowns = Deps.get<Cooldowns>(Cooldowns),
        private validators = Deps.get<Validators>(Validators)) {}

    async init() {
        const files = await readdir('./src/commands');
        
        for (const fileName of files) {
            const cleanName = fileName.replace(/(\..*)/, '');
            
            const Command = await require(`../commands/${cleanName}`).default;
            if (!Command) continue;
            
            const command = new Command();
            this.commands.set(command.name, command);
        }
        Log.info(`Loaded: ${this.commands.size} commands`, `cmds`);
    }

    async handle(msg: Message, prefix: string) {
        if (!(msg.member && msg.content && msg.guild && !msg.author.bot)) return;

        return this.handleCommand(msg, prefix);
    }
    private async handleCommand(msg: Message, prefix: string) {
        try {
            const slicedContent = msg.content.slice(prefix.length);

            const command = this.findCommand(slicedContent);
            if (!command || this.cooldowns.active(msg.author, command)) return;

            this.validators.checkPreconditions(command, msg.member);

            await command.execute(new CommandContext(msg), 
            ...this.getCommandArgs(slicedContent));
            
            this.cooldowns.add(msg.author, command);
        } catch (error) {
            const content = error?.message ?? 'Un unknown error occurred';          
            msg.channel.send(':warning: ' + content);
        }
    }

    private findCommand(slicedContent: string) {
        const name = this.getCommandName(slicedContent);
        return this.commands.get(name)
            ?? this.findByAlias(name);
    }
    private findByAlias(name: string) {   
        return Array.from(this.commands.values())
            .find(c => c.aliases?.some(a => a === name));
    }

    private getCommandArgs(slicedContent: string) {
        return slicedContent
            .split(' ')
            .slice(1)
    }

    private getCommandName(slicedContent: string) {
        return slicedContent
            ?.toLowerCase()
            .split(' ')[0];
    }
}
