const TOKEN_KEY = "erunala_era_token";
const ADDRESS_KEY = "erunala_era_address";
const ACCOUNT_KEY = "erunala_era_account";

export default class UserTokenManager {
  private static _token: string = "";
  private static _address: string = "";
  private static _account: string = "";
  private static _dirty: boolean = true;

  private static loadFromStorage(): void {
    if (!this._dirty) return;
    this._token = localStorage.getItem(TOKEN_KEY) || "";
    this._address = localStorage.getItem(ADDRESS_KEY) || "";
    this._account = localStorage.getItem(ACCOUNT_KEY) || "";
    this._dirty = false;
  }

  static get token(): string {
    this.loadFromStorage();
    return this._token;
  }

  static get address(): string {
    this.loadFromStorage();
    return this._address;
  }

  static get account(): string {
    this.loadFromStorage();
    return this._account;
  }

  static get hasToken(): boolean {
    return !!this.token && !!this.address;
  }

  static save(token: string, address: string, account: string = ""): void {
    localStorage.setItem(TOKEN_KEY, token || "");
    localStorage.setItem(ADDRESS_KEY, address || "");
    localStorage.setItem(ACCOUNT_KEY, account || "");
    this._token = token || "";
    this._address = address || "";
    this._account = account || "";
    this._dirty = false;
  }

  static clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADDRESS_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    this._token = "";
    this._address = "";
    this._account = "";
    this._dirty = false;
  }
}