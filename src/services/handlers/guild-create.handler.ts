import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import { Guild, MessageEmbed } from 'discord.js';
import Guilds from '../../data/guilds';
import config from '../../../config.json';

export default class GuildCreateHandler implements EventHandler {
    on = 'guildCreate';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

    async invoke(guild: Guild) {
        await this.guilds.get(guild);

        try {
            await this.sendJoinMessage(guild);
        } catch {}
    }

    sendJoinMessage(guild: Guild) {
        return guild.systemChannel
            ?.send(new MessageEmbed({
                title: `Hey!`,
                fields: [
                    { name: ':rocket: Check out your server listing...', value: `${config.dashboardURL}/servers/${guild.id}` },
                    { name: ':art: Customize it at...', value: `${config.dashboardURL}/dashboard/servers/${guild.id}/edit` }
                ],
                thumbnail: { url: guild.iconURL({ dynamic: true, size: 64 }) }
            }));
    }
}