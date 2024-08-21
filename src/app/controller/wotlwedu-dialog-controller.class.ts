export class WotlweduDialogController {
    private _yesAction: Function = null;
    private _noAction: Function = null;
    private _objectData: any = null;
    isVisible: boolean = false;
    message: string = "";

    constructor() {}

    setYesAction( cb: Function ) {
        this._yesAction = cb;
    }

    setNoAction( cb: Function ) {
        this._noAction = cb;
    }

    setObjectData( data: any ) {
        this._objectData = data;
    }

    setMessage( message: string ) {
        this.message = message;
    }

    show() {
        this.isVisible = true;
    }

    hide() {
        this.isVisible = false;
    }

    onYesClick() {
        if( this._yesAction ) this._yesAction( this._objectData );
        this.hide();
    }

    onNoClick() {
        if( this._noAction) this._noAction( this._objectData );
        this.hide();
    }

    onCloseClick() {
        this.hide();
    }
}