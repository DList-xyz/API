import { Command, CommandContext, Permission } from './command';
import Guilds from '../data/guilds';
import Deps from '../utils/deps';

export default class InviteCommand implements Command {
    name = 'invite';
    summary = 'Update the invite for your server.';
    precondition: Permission = '';
    cooldown = 3;
    module = 'General';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}
    
    execute = async (ctx: CommandContext) => {
        const savedGuild = await this.guilds.get(ctx.guild.id);
        savedGuild.lastBumpAt = new Date();
        await savedGuild.save();

        const newInvite = await ctx.channel
            .createInvite({ temporary: false, reason: 'Invite command executed.' });

        return ctx.channel.send(`✔ Invite updated to \`${newInvite.code}\`!`);
    }
}
