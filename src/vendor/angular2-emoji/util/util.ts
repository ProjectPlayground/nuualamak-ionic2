import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

declare var require: any

//let emojis = require('../db/emoji.json');

const PARSE_REGEX = /:([a-zA-Z0-9_\-\+]+):/g;

@Injectable()
export class EmojiUtil {

  private emojis: Array<any>;

  constructor(private http: Http) {
  }

  public getAll() {
    if (this.emojis) {
      return Promise.resolve(this.emojis ? this.emojis.filter(e => e.emoji != '😀' && e.emoji != '😛') : []);
    } else {
      return this.loadEmojis().then(() => this.getAll());
    }
  }

  public emojify(str) {
    return str.split(PARSE_REGEX).map((emoji, index) => {
      // Return every second element as an emoji
      if (index % 2 === 0) {
        return emoji;
      }
      return this.get(emoji);
    }).join('');
  }


  private get(emoji) {
    if (this.emojis) {
      for (let data of this.emojis) {
        for (let e of data.aliases) {
          if (emoji === e) {
            return data.emoji;
          }
        }
      }
      return Promise.resolve(':' + emoji + ':');
    } else {
      return this.loadEmojis().then(() => this.get(emoji));
    }
  }

  private loadEmojis() {
    return this.http.get('assets/emoji.json').toPromise().then(res => {
      this.emojis = res.json();
    });
  }
}
