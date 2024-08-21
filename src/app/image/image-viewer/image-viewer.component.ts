import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.css',
})
export class ImageViewerComponent implements OnInit {
  @Input() dataId: string = null;
  @Input() extra: any = null;
  @Output() close = new EventEmitter<void>();
  image: WotlweduImage = null;

  constructor(private imageDataService: ImageDataService) {}

  ngOnInit(): void {
    if (this.dataId) {
      this.imageDataService.getData(this.dataId, this.extra).subscribe({
        next: (response) => {
          if (response && response.data && response.data.image) {
            this.image = response.data.image;
          }
        },
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}
