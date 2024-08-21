/* 
Make the DIV element draggable:
https://www.w3schools.com/howto/howto_js_draggable.asp
*/

export class WotlweduDragWindowController {
    private _element: any;
    private pos1 = 0;
    private pos2: number = 0;
    private pos3:number  = 0;
    private pos4: number = 0;

  constructor() {}

  dragElement(draggable: string) {
    this._element = document.getElementById(draggable);
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;

    if (document.getElementById(draggable + 'header')) {
      // if present, the header is where you move the DIV from:
      document.getElementById(draggable + 'header').onmousedown = this._dragMouseDown.bind(this);
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      document.getElementById(draggable).onmousedown = this._dragMouseDown.bind(this);
    }
}

    private _dragMouseDown(e: any) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;
      document.onmouseup = this._closeDragElement.bind(this);
      // call a function whenever the cursor moves:
      document.onmousemove = this._elementDrag.bind(this);
    }

    private _elementDrag(e: any) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      this.pos1 = this.pos3 - e.clientX;
      this.pos2 = this.pos4 - e.clientY;
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;

      // set the element's new position:
      this._element.style.top = this._element.offsetTop - this.pos2 + 'px';
      this._element.style.left = this._element.offsetLeft - this.pos1 + 'px';
    }

    private _closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  
    reset() {
        this._closeDragElement();
        this._element = null;
    }

//   dragElement(draggable: string) {
//     let pos1 = 0,
//       pos2 = 0,
//       pos3 = 0,
//       pos4 = 0;
//       let element;

//     element = document.getElementById(draggable);

//     if (document.getElementById(draggable + 'header')) {
//       // if present, the header is where you move the DIV from:
//       document.getElementById(draggable + 'header').onmousedown = dragMouseDown;
//     } else {
//       // otherwise, move the DIV from anywhere inside the DIV:
//       document.getElementById(draggable).onmousedown = dragMouseDown;
//     }

//     function dragMouseDown(e: any) {
//       e = e || window.event;
//       e.preventDefault();
//       // get the mouse cursor position at startup:
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       document.onmouseup = closeDragElement;
//       // call a function whenever the cursor moves:
//       document.onmousemove = elementDrag;
//     }

//     function elementDrag(e: any) {
//       e = e || window.event;
//       e.preventDefault();
//       // calculate the new cursor position:
//       pos1 = pos3 - e.clientX;
//       pos2 = pos4 - e.clientY;
//       pos3 = e.clientX;
//       pos4 = e.clientY;

//       // set the element's new position:
//       element.style.top = element.offsetTop - pos2 + 'px';
//       element.style.left = element.offsetLeft - pos1 + 'px';
//     }

//     function closeDragElement() {
//       // stop moving when mouse button is released:
//       document.onmouseup = null;
//       document.onmousemove = null;
//     }
//   }
}
