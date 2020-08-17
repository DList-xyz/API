import ImageGenerator from './image-generator';
import { createCanvas, loadImage, CanvasRenderingContext2D, Canvas } from 'canvas';
import { User, Guild } from 'discord.js';
import { GuildDocument } from '../../../data/models/guild';

export class ServerWidgetGenerator extends ImageGenerator {
    colors = {
        primary: '#F4F2F3',
        secondary: '#46828D',
        tertiary: '#36E2CA',
        bgPrimary: '#2C2F33',
        bgSecondary: '#23272A'
    }

    constructor(
        private guild: Guild,
        private savedGuild: GuildDocument) { super(); }

    async generate(size = 'large') {
        if (size === 'medium')
            return this.medium();
        else if (size === 'small')
            return this.small();
        return this.large();
    }

    private async large() {
        const { canvas, ctx } = this.createCanvas(300, 250);
        
        ctx.fillStyle = this.colors.bgPrimary;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.addGuildText(ctx, canvas);        
        await this.addGuildAvatar(ctx);
        await this.addStats(ctx, canvas);
        this.addGuildOverview(ctx, canvas);

        await this.addFooter(canvas, ctx);

        return canvas.toBuffer();
    }

    private async medium() {
        const { canvas, ctx } = this.createCanvas(300, 150);
        
        ctx.fillStyle = this.colors.bgPrimary;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.addGuildText(ctx, canvas, { x: 0, y: 20 });        
        await this.addGuildAvatar(ctx, { x: 0, y: 0 });
        await this.addStats(ctx, canvas, { x: 0, y: 35 });

        await this.addFooter(canvas, ctx, { x: 0, y: -7.5 });

        return canvas.toBuffer();
    }

    private async small() {
        const { canvas, ctx } = this.createCanvas(300, 75);
        
        ctx.fillStyle = this.colors.bgPrimary;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
              
        await this.addGuildAvatar(ctx, { x: -5, y: -15 }, true);
        await this.addStats(ctx, canvas, { x: canvas.width - 150, y: -10 });

        await this.addFooter(canvas, ctx, { x: 0, y: -15 });

        return canvas.toBuffer();
    }

    async addStats(ctx: CanvasRenderingContext2D, canvas: Canvas, offset: Vector2D = { x: 0, y: 0 }) {
        const pos = { x: offset.x, y: canvas.height / 3.25 + offset.y };
        
        const votesImage = await loadImage(`assets/img/chevron-circle-up.png`);
        const nativeSize = { w: 128, h: 128 };

    ctx.drawImage(votesImage, pos.x + 25, pos.y,
            nativeSize.w / 6, nativeSize.h / 6);
        
        ctx.font = 'bold 16px Whitney, sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(this.savedGuild.votes.length.toString(),
            pos.x + 50, pos.y + 16.5);
    }

    private addGuildOverview(ctx: CanvasRenderingContext2D, canvas) {
        ctx.font = '16px Whitney, sans-serif';
        ctx.fillStyle = 'gray';
        super.wrapText(ctx, this.savedGuild.listing.overview,
            25, canvas.height / 2, canvas.width - 50, 20);
    }

    private async addFooter(canvas, ctx: CanvasRenderingContext2D, offset: Vector2D = { x: 0, y: 0 }) {
        const pos = { x: 10 + offset.x, y: canvas.height * 0.9 + offset.y };

        ctx.fillStyle = this.colors.bgSecondary;
        ctx.fillRect(0, pos.y - 5, canvas.width, canvas.height);

        const avatar = await loadImage('assets/img/logo.png');

        const nativeSize = { w: 231, h: 46 };
        
        ctx.drawImage(avatar, pos.x, pos.y,
            nativeSize.w / 2.5, nativeSize.h / 2.5);
    }

    private addGuildText(ctx: CanvasRenderingContext2D, canvas, offset: Vector2D = { x: 0, y: 0 }) {
        const pos = { x: canvas.width / 4 + offset.x, y: canvas.height / 5 + offset.y };

        ctx.font = super.applyText(canvas, this.guild.name);
        ctx.fillStyle = this.colors.primary;
        ctx.fillText(this.guild.name, pos.x, pos.y);
    }

    private async addGuildAvatar(ctx: CanvasRenderingContext2D, offset: Vector2D = { x: 0, y: 0 }, square = false) {
        const pos = { x: 15 + offset.x, y: 15 + offset.y };

        if (square) {
            const avatar = await loadImage(this.guild.iconURL({ format: 'png' }));
            return ctx.drawImage(avatar, pos.x, pos.y, 50, 50);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x + 25, pos.y + 25, 25, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(this.guild.iconURL({ format: 'png' }));
        ctx.drawImage(avatar, pos.x, pos.y, 50, 50);

        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.closePath();
        ctx.restore();
    }

    private createCanvas(width: number, height: number) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        return { canvas, ctx };
    }
}

interface Vector2D { x: number, y: number }