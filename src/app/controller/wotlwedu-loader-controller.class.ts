export class WotlweduLoaderController {
    loading: boolean = false;

    constructor() {
        this.loading = false;
    }

    start() {
        this.loading = true;
    }

    stop() {
        this.loading = false;
    }
}