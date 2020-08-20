import { Command, CommandContext, Permission } from './command';
import Guilds from '../data/guilds';
import Deps from '../utils/deps';
import config from '../../config.json';

export default class BumpCommand implements Command {
    name = 'bump';
    summary = 'Bump your server.';
    precondition: Permission = '';
    cooldown = 60 * 60;
    module = 'General';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}
    
    execute = async (ctx: CommandContext) => {
        const savedGuild = await this.guilds.get(ctx.guild);
        savedGuild.lastBumpAt = new Date();
        await savedGuild.save();

        return ctx.channel.send(`👊 Bumped -> ${config.dashboardURL}`);
    }
}
