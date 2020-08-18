import { Command, CommandContext, Permission } from './command';

export default class HelpCommand implements Command {
    name = 'help';
    summary = 'List all commands.';
    precondition: Permission = '';
    module = 'General';
    
    execute = async (ctx: CommandContext) => {
        return ctx.channel.send(
            '`.dl help` -> show this\n' +
            '`.dl bump` -> bump a server\n' +
            '`.dl invite` -> update server invite');
    }
}
