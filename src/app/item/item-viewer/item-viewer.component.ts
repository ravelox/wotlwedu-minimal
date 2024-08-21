import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WotlweduItem } from '../../datamodel/wotlwedu-item.model';
import { ItemDataService } from '../../service/itemdata.service';

@Component({
  selector: 'app-item-viewer',
  templateUrl: './item-viewer.component.html',
  styleUrl: './item-viewer.component.css',
})
export class ItemViewerComponent implements OnInit {
  @Input() dataId: string = null;
  @Input() extra: any = null;
  @Output() close = new EventEmitter<void>();
  item: WotlweduItem = null;

  constructor(private itemDataService: ItemDataService) {}

  ngOnInit(): void {
    if (this.dataId) {
      this.itemDataService.getData(this.dataId, this.extra).subscribe({
        next: (response) => {
          if (response && response.data && response.data.item) {
            this.item = response.data.item;
          }
        },
      });
    }
  }

  onClose() {
    this.close.emit();
  }

  onContextMenu(event: any, index: number) {
    event.preventDefault();
  }
}
