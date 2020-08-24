import Log from '../../utils/log';
import EventHandler from './event-handler';
import { bot } from '../../bot';
import config from '../../../config.json';
import CommandService from '../command.service';
import Deps from '../../utils/deps';
import { API } from '../../api/server';

export default class ReadyHandler implements EventHandler {
    on = 'ready';

    constructor(
        private commandService = Deps.get<CommandService>(CommandService),
        private api = Deps.get<API>(API)) {}

    async invoke() {        
        Log.info(`Bot is live!`, `events`);
        
        await bot.user.setPresence({
            activity: {
                name: config.bot.activity,
                type: 'WATCHING',
                url: 'https://dlist.xyz'
            }            
        });
        
        await this.commandService.init();
        await this.api.initSitemaps();
    }
}
