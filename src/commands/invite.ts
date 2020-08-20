import { Command, CommandContext, Permission } from './command';
import Guilds from '../data/guilds';
import Deps from '../utils/deps';

export default class InviteCommand implements Command {
    name = 'invite';
    summary = 'Update the invite for your server.';
    precondition: Permission = 'MANAGE_CHANNELS';
    cooldown = 1 * 60;
    module = 'General';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}
    
    execute = async (ctx: CommandContext) => {
        const savedGuild = await this.guilds.get(ctx.guild);
        savedGuild.lastBumpAt = new Date();

        const { code } = await ctx.channel
            .createInvite({ temporary: false, maxAge: 0, reason: 'Invite command executed.' });
            
        savedGuild.invite = code;
        await savedGuild.save();

        return ctx.channel.send(`☑ Invite updated to \`${code}\`!`);
    }
}
