import { Injectable } from "@angular/core";

class WotlweduSelectionData {
  type: string;
  id: string;
}

@Injectable({ providedIn: "root" })
export class WotlweduSelectionService {
  private _selection: WotlweduSelectionData[] = [];

  constructor() {}

  reset() {
    this._selection = [];
  }

  find(id: string) {
    return this._selection.find((x) => {
      return x.id === id;
    });
  }

  get(type: string) {0
    return this._selection.filter((x) => x.type === type);
  }

  push(type: string, id: string) {
    if (!type || !id) return;

    // Check to see if the ID already exists
    if (!this.find(id)) {
      this._selection.push({
        type: type,
        id: id,
      });
    }
  }

  removeType(type: string) {
    const filteredValues = this._selection.filter((x) => x.type !== type);
    this._selection = filteredValues.slice();
  }

  removeId(id: string) {
    const filteredValues = this._selection.filter((x) => x.id !== id);
    this._selection = filteredValues.slice();
  }

  dump() {
    console.log(this._selection);
  }
}
