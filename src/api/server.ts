import express from 'express';
import config from '../../config.json';
import cors from 'cors';
import OAuthClient from 'disco-oauth';
import bodyParser from 'body-parser';
import { join } from 'path';
import rateLimiter from './modules/rate-limiter';
import Log from '../utils/log';
import Deps from '../utils/deps';
import Stats from './modules/stats';

import { router as apiRoutes } from './routes/api-routes';
import { router as serversRoutes } from './routes/servers/servers-routes';
import { router as manageBotRoutes } from './routes/servers/manage-server-routes';
import { router as reviewerRoutes } from './routes/servers/reviewer-routes';
import { router as statsRoutes } from './routes/servers/stats-routes';
import { router as userRoutes } from './routes/user-routes';

export const app = express(),
             AuthClient = new OAuthClient(config.bot.id, config.bot.secret);

export class API {
    constructor(private stats = Deps.get<Stats>(Stats)) {        
        AuthClient.setRedirect(`${config.api.url}/auth`);
        AuthClient.setScopes('identify', 'guilds');

        app.use(rateLimiter);
        app.use(cors());
        app.use(bodyParser.json());

        app.use('/api/user', userRoutes);
        app.use('/api/servers', serversRoutes, manageBotRoutes);
        app.use('/api/servers/:id', reviewerRoutes, statsRoutes);
        app.use('/api', apiRoutes);

        app.get('/server', (req, res) => res.redirect(`https://discord.gg/${config.api.supportInvite}`));
        
        app.use(express.static(join(__dirname, '../../../dist/dashboard')));
        
        app.all('*', (req, res) => res.status(200).sendFile(
            join(__dirname, '../../../dist/dashboard/index.html')));

        const port = config.api.port || 3000;
        app.listen(port, () => Log.info(`API is live on port ${port}`));
        
        this.stats.init();
    }
}