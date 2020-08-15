import { Command, CommandContext, Permission } from './command';
import Guilds from '../data/guilds';
import Deps from '../utils/deps';

export default class BumpCommand implements Command {
    name = 'bump';
    summary = 'Bump your server.';
    precondition: Permission = '';
    cooldown = 3;
    module = 'General';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}
    
    execute = async (ctx: CommandContext) => {
        const savedGuild = await this.guilds.get(ctx.guild.id);
        savedGuild.lastBumpAt = new Date();
        await savedGuild.save();

        return ctx.channel.send('👊 Bumped!');
    }
}
