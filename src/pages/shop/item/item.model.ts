
export class ItemModel {

  id: string;
  name: string;
  price: number;
  daysToExpire: number;
  // category available => theme, bold, fontName, fontColor (TODO add emoticon)
  category: string;

  backgroundImage: string;
  takeAllPlace: boolean;
  fontName: string;
  fontColor: string;
  emoticon: string;
  // We have only a category bold, but it don't have a value
  //bold: string;

  constructor() {
    //this.id = '';
    this.name = '';
    this.category = '';
    //this.price = 0;
    //this.daysToExpire = 0;

    //this.backgroundImage = '';
    //this.takeAllPlace = false;
    //this.fontName = '';
    //this.fontColor = '';
    //this.emoticon = '';
  }
}
