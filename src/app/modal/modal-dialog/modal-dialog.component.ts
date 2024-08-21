import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.css',
})
export class ModalDialogComponent {
  @Input() message: string;
  @Output() close = new EventEmitter<void>();
  @Output() yesAction = new EventEmitter<void>();
  @Output() noAction = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onYes() {
    this.yesAction.emit();
  }

  onNo() {
    this.noAction.emit();
  }
}
