export class WotlweduAlert {
  errorMessage: string;

  constructor() {
    this.errorMessage = null;
  }

  setErrorMessage(errorMessage: string) {
    if( ! errorMessage ) return;
    this.errorMessage = errorMessage;
  }

  onCloseAlert() {
    this.errorMessage = null;
  }

  handleError( error: any ) {
    if( error && error.error && error.error.message ) {
      this.errorMessage = error.error.message;
    }
  }
}