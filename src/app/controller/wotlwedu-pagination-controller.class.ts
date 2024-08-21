export class WotlweduPages {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  currentPage: number;
  private service: any;

  constructor() {
    this.hasPrevPage = false;
    this.hasNextPage = false;
    this.currentPage = 0;
  }

  setService(service) {
    if (service) this.service = service;
  }

  updatePages() {
    if (!this.service) return;
    this.currentPage = this.service.page;
    this.hasPrevPage = this.service.page > 1;
    this.hasNextPage =
      this.service.total - this.service.itemsPerPage * this.service.page > 0;
  }

  onNextPage() {
    if (this.service) this.service.nextPage();
  }

  onPrevPage() {
    if( this.service ) this.service.prevPage();
  }
}
