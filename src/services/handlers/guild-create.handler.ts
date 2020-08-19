import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import { Guild } from 'discord.js';
import Guilds from '../../data/guilds';

export default class GuildCreateHandler implements EventHandler {
    on = 'guildCreate';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

    invoke(guild: Guild) {
        return this.guilds.get(guild);
    }
}