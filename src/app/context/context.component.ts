/*
Created this based on the answers at
https://stackoverflow.com/questions/4909167/how-to-add-a-custom-right-click-menu-to-a-webpage 
*/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WotlweduContextOption } from '../datamodel/wotlwedu-context-option.model';
import { Subscription } from 'rxjs';
import { DataSignalService } from '../service/datasignal.service';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrl: './context.component.css',
})
export class ContextComponent implements OnInit {
  @Input() options: WotlweduContextOption[];
  @Input() objectId: string = null;
  @Input() objectData: any = null;
  @Input() divTop: number;
  @Input() divLeft: number;
  @Output() clickAway = new EventEmitter<string>();

  private _show: boolean = false;
  private _closeDown: Subscription;

  constructor(private dataSignalService: DataSignalService) {}

  ngOnInit() {
    this._closeDown = this.dataSignalService.dialogCloseSignal.subscribe({
      next: (canClose) => {
        if (canClose === true) {
          this._show = false;
        }
      },
    });
    this._show = false;
  }

  ngOnDestroy() {
    if (this._closeDown) this._closeDown.unsubscribe();
  }

  @Input()
  set show(value: boolean) {
    this._show = value;
    if (value === true) {
      this.onClick = this.onClick.bind(this);
      document.addEventListener('click', this.onClick, { once: true });
    }
  }

  get show() {
    return this._show;
  }

  onClick(event): any {
    event.preventDefault();
    this.clickAway.emit();
    this.show = false;
    document.removeEventListener('click', this.onClick);
  }

  onSelect(index: number) {
    this.options[index].cb({ id: this.objectId, data: this.objectData });
  }
}
