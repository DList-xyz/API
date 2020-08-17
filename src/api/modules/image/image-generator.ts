import { Canvas, registerFont } from 'canvas';

export default class ImageGenerator {
  constructor() {
    registerFont('./assets/fonts/whitneysemibold.ttf', { family: 'Whitney' });
  }

  applyText(canvas: Canvas, text: string, offsetX = 25) {
    const context = canvas.getContext('2d');
    let fontSize = 32;

    do {
      context.font = `${fontSize -= 4}px Whitney, sans-serif`;
    }
    while (context.measureText(text).width > canvas.width - offsetX);
    return context.font;
  }
  wrapText(context, text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }
}