import Deps from '../../utils/deps';
import Servers from '../../data/servers';
import { ServerDocument } from '../../data/models/server';
import { bot } from '../../bot';

const distinct = (v, i, a) => a.indexOf(v) === i;

export default class Stats {
  private savedServers: ServerDocument[] = [];

  general(id: string): GeneralStats {
    const guild = bot.guilds.cache.get(id);
    const savedServer = this.savedServers.find(b => b.id === id);
    if (!savedServer || !guild)
      return null;
    
    return {
      memberCount: guild.members.cache.size,
      lastVoteAt: savedServer.lastVoteAt,
      totalVotes: savedServer.totalVotes,
      voteCount: savedServer.votes.length
    }
  }

  votes(id: string) {
    return this.savedServers
      .find(b => b.id === id)?.votes;
  }

  recentVotes(id: string): VoteStats[] {
    const savedServer = this.savedServers.find(b => b.id === id);
    if (!savedServer)
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
        count: savedServer.votes
          .filter(v => v.at?.getDate() === date?.getDate()).length }))
      .reverse();
  }

  topVoters(id: string): TopVoterStats[] {
    const savedServer = this.savedServers.find(b => b.id === id);
    if (!savedServer)
      return null;

    return savedServer.votes
      .map(c => c.by)
      .filter(distinct)
      .map(id => ({ userId: id, count: savedServer.votes.filter(v => v.by = id).length }));
  }

  constructor(private servers = Deps.get<Servers>(Servers)) {}

  async init() {
    await this.updateValues();

    const interval = 30 * 60 * 1000;
    setInterval(() => this.updateValues(), interval);
  }

  async updateValues() {
    this.savedServers = await this.servers.getAll();
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