import Log from '../../utils/log';
import EventHandler from './event-handler';
import { bot } from '../../bot';
import config from '../../../config.json';
import CommandService from '../command.service';
import Deps from '../../utils/deps';

export default class ReadyHandler implements EventHandler {
    on = 'ready';

    constructor(private commandService = Deps.get<CommandService>(CommandService)) {}

    async invoke() {        
        Log.info(`Bot is live!`, `events`);
        
        await bot.user.setPresence({
            activity: {
                name: config.bot.activity,
                type: 'WATCHING',
                url: 'https://dbots.co'
            }            
        });
        
        await this.commandService.init();
    }
}
