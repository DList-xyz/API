import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { bot } from '../../bot';
import config from '../../../config.json';

export default class SitemapGenerator {
  rootNames = [
    'search'
  ];

  docNames = [
    'api',
    'get-started',
    'badges',
    'get-featured',
    'guidelines',
    'how-it-works',
    'widget',
    'changelog'];

  tagNames = [
    'anime',
    'art',
    'bots',
    'chat',
    'chill',
    'community',
    'fortnite',
    'friendly',
    'games',
    'gaming',
    'givaways',
    'manga',
    'meme',
    'minecraft',
    'music',
    'roblox',
    'rp',
    'technology',
    'youtube'
  ];

  constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

  private template(data: string) {
    return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${data}</urlset>`;
  }
  
  private url(url: string) {
    return `<url><loc>${url}</loc></url>`;
  }
  
  private comment(data: string) {
    return `<!-- ${data} -->`;
  }
  
  
  getRootMap() {
    const xml = (arr: string[], routes = '/') => arr
      .map(n => this.url(`${config.dashboardURL}${routes ?? '/'}${n}`))
      .join('');

    return this.template(
      this.comment('root') + xml(this.rootNames) +
      this.comment('docs') + xml(this.docNames, '/docs/') +
      this.comment('tags') + xml(this.tagNames, '/tags/'));
  }
  
  async getGuildsMap() {
    const savedGuilds = await this.guilds.getAll();
    return this.template(savedGuilds
      .filter(sg => bot.guilds.cache.has(sg._id))
      .map(sg => this
        .url(`${config.dashboardURL}/servers/${sg._id}`))
        .join(''));
  }
}