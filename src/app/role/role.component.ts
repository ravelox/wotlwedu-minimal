import { Component, OnInit } from '@angular/core';
import { DragAndDropService } from '../service/dragdrop.service';
import { WotlweduDragAndDropController } from '../controller/wotlwedu-draganddrop-controller';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrl: './role.component.css',
})
export class RoleComponent implements OnInit {
  dnd: WotlweduDragAndDropController;

  constructor( private dragAndDropService: DragAndDropService){}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController( this.dragAndDropService )
  }

}