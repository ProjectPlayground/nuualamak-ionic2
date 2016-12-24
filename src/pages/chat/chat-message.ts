
export class ChatMessage {

  private _user: {username: string, uid: string};
  private _content: string;
  private _timestamp: number;

  constructor() {
    this._user = {username: '', uid: ''};
    this._content = '';
    this._timestamp = 0;
  }

  get user(): {username: string; uid: string} {
    return this._user;
  }

  set user(value: {username: string; uid: string}) {
    this._user = value;
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  set timestamp(value: number) {
    this._timestamp = value;
  }
}
