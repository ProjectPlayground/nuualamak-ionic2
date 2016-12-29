import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {EmojiUtil} from './util/util';
import {EmojiInputComponent} from './input/input';
import { IonicModule } from 'ionic-angular';

@NgModule({
  declarations: [EmojiInputComponent],
  imports: [IonicModule, CommonModule, FormsModule],
  exports: [EmojiInputComponent],
  providers: [EmojiUtil]
})
export class EmojiModule { }
