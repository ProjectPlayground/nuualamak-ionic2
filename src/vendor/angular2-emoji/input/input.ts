import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmojiUtil } from '../util/util';

@Component({
  selector: 'emoji-input',
  templateUrl: 'input.html'
})
export class EmojiInputComponent {

  @Input() popupAnchor = 'top';
  @Input() model: any;
  @Input() fullWidth: boolean;
  @Input() marginTopEmojiOpener: '3px';
  @Output() modelChange: any = new EventEmitter();

  input: string;
  filterEmojis: string;
  allEmojis: Array<any>;
  popupOpen: boolean = false;
  private caretOffset = 0;

  constructor(private emojiUtil: EmojiUtil) {
    this.allEmojis = new Array();
    this.input = '';
    this.filterEmojis = '';
    this.emojiUtil.getAll()
      .then(allEmojis => this.allEmojis = allEmojis);
  }

  //ngOnChanges() {
  //  if (this.model !== this.input) {
  //    this.input = this.model;
  //  }
  //}

  saveCursorPosition(customInput) {
    if (customInput._inputElement) {
      this.caretOffset = customInput._inputElement.nativeElement.selectionStart;
    } else if (customInput._elementRef) {
      this.caretOffset = customInput._elementRef.nativeElement.children[0].selectionStart;
    } else {
      console.error('Could not access nativeElement of customInput');
    }
  }

  togglePopup() {
    this.popupOpen = !this.popupOpen;
  }

  getFilteredEmojis() {
    return this.allEmojis.filter((e) => {
      if (this.filterEmojis === '') {
        return true;
      } else {
        for (let alias of e.aliases) {
          if (alias.includes(this.filterEmojis)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  onEmojiClick(e) {
    console.log('onEmojiClick');
    this.input = this.input.slice(0, this.caretOffset) + e + this.input.slice(this.caretOffset);
    this.modelChange.emit(this.input);
    this.popupOpen = false;
  }

  onChange(event) {
    this.input = this.emojiUtil.emojify(event.srcElement.value);
    this.model = this.input;
    this.modelChange.emit(this.input);
  }
}
