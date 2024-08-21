import { BehaviorSubject } from 'rxjs';

export class WotlweduPagination {
  itemsPerPage: number;
  total: number;
  page: number;
  cb: VoidFunction;
  currentFilter: string = '';
  cancel = new BehaviorSubject<boolean>(false);

  /*
To be used between detail and selection components to reset selected item indication
in the selection component when cancel button is clicked in the detail component
  */
  onCancel() {
    this.cancel.next(true);
  }

  /* Function to call to get data list after any modifications */
  setCallbackFunction(cb: VoidFunction) {
    if (cb) this.cb = cb;
  }

  nextPage() {
    const currentItemIndex = this.page * this.itemsPerPage;
    if (this.total - currentItemIndex > 0) {
      this.page = this.page + 1;
      if (this.cb) this.cb();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page = this.page - 1;
      this.cb();
    }
  }

  reset() {
    this.page = 1;
    this.cb();
  }

  filterUpdate(filter) {
    if (filter || filter === '') {
      if (filter !== this.currentFilter) {
        this.page = 1;
        this.currentFilter = filter;
      }
    } else {
      this.currentFilter = filter ? filter : '';
    }
  }

  resetFilter() {
    this.currentFilter = '';
  }
}
