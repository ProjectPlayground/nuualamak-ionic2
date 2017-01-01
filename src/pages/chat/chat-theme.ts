
export class ChatTheme {

  fontName: string;
  fontColor: string;
  backgroundImage: string ;
  isBold: boolean;
  takeAllPlace: boolean;

  constructor() {
    this.fontName = 'inherit';
    this.fontColor = 'black';
    this.backgroundImage = '';
    this.isBold = false;
    this.takeAllPlace = false;
    this.backgroundImage = 'assets/default_background.png';
  }

}
