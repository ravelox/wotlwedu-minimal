import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { WotlweduDragWindowController } from '../../controller/wotlwedu-dragwindow-controller.class';

@Component({
  selector: 'app-image-select-mini',
  templateUrl: './image-select-mini.component.html',
  styleUrl: './image-select-mini.component.css',
})
export class ImageSelectMiniComponent implements OnInit, OnDestroy {
  images: WotlweduImage[];
  imagesSub: Subscription;

  imageData = new BehaviorSubject<any>(null);
  listName: string = 'imagemini';
  @Output() close = new EventEmitter<void>();
  @Output() imageselected = new EventEmitter<string>();
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;
  dragWindow: WotlweduDragWindowController = new WotlweduDragWindowController();

  constructor(
    private imageDataService: ImageDataService,
    router: Router,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController(this.dragAndDropService);
    this.pages.setService(this.imageDataService);
    this.filter.setService(this.imageDataService);
    this.dragWindow.dragElement("imageminiselect")
    this.imagesSub = this.imageDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (images) => {
        this.images = images;
        this.pages.updatePages();
      },
    });
  }

  ngOnDestroy() {
    this.imagesSub.unsubscribe();
  }
  
  onSelect(index: number) {
    this.imageDataService.setData(this.images[index]);
    this.imageselected.emit( this.images[index].id)
  }

  onClose() {
    this.close.emit();
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }
}
