import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

export class WotlweduFilterController {
  form: FormGroup;
  private _update = new Subject<string>();
  private _service: any = null;

  constructor() {
    this._initForm();
  }

  setService(service) {
    this._service = service;
    this._update
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this._service.getAllData(value);
      });
      this._service.getAllData();
  }

  onChange(event) {
    this._update.next(event.target.value);
  }

  private _initForm() {
    this.form = new FormGroup({
      filterString: new FormControl(''),
    });
  }

  onReset() {
    if (this._service) {
      this._service.reset();
      this._service.getAllData();
    }
    this._initForm();
  }
}
