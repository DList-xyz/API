import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { GuildDocument } from '../../data/models/guild';
import { bot, emitter } from '../../bot';

const distinct = (v, i, a) => a.indexOf(v) === i;

export default class Stats {
  private savedGuilds: GuildDocument[] = [];

  constructor(private guilds = Deps.get<Guilds>(Guilds)) {
    emitter.on('savedGuildCreate',
      (savedGuild) => this.savedGuilds.push(savedGuild));
  }

  general(id: string): GeneralStats {
    const guild = bot.guilds.cache.get(id);
    const savedGuild = this.savedGuilds.find(b => b.id === id);
    if (!savedGuild || !guild)
      return null;
    
    return {
      memberCount: guild.members.cache.size,
      lastVoteAt: savedGuild.lastVoteAt,
      totalVotes: savedGuild.totalVotes,
      voteCount: savedGuild.votes.length
    }
  }

  votes(id: string) {
    return this.savedGuilds
      .find(b => b.id === id)?.votes;
  }

  recentVotes(id: string): VoteStats[] {
    const savedGuild = this.savedGuilds.find(b => b.id === id);
    if (!savedGuild)
      return null;

    return Array(7)
      .fill(new Date())
      .map((today, i) => new Date(today - 8.64e7 * i))
      .map(date => ({
        day: `${
          date.getDate()
            .toString()
            .padStart(2, '0')}/${
          (date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`,
        count: savedGuild.votes
          .filter(v => v.at?.getDate() === date?.getDate()).length }))
      .reverse();
  }

  topVoters(id: string): TopVoterStats[] {
    const savedGuild = this.savedGuilds.find(b => b.id === id);
    if (!savedGuild)
      return null;

    return savedGuild.votes
      .map(c => c.by)
      .filter(distinct)
      .map(id => ({ userId: id, count: savedGuild.votes.filter(v => v.by = id).length }));
  }

  async init() {
    await this.updateValues();

    const interval = 30 * 60 * 1000;
    setInterval(() => this.updateValues(), interval);
  }

  async updateValues() {
    this.savedGuilds = await this.guilds.getAll();
  }
}

export interface GeneralStats {
  memberCount: number;
  lastVoteAt: Date;
  totalVotes: number;
  voteCount: number;
}

export interface TopVoterStats {
  count: number;
  userId: string;
}

export interface VoteStats {
  count: number;
  day: string;
}