import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WotlweduCap } from '../datamodel/wotlwedu-cap.model';
import { CapDataService } from '../service/capdata.service';
import { WotlweduPages } from '../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../controller/wotlwedu-filter-controller';
import { WotlweduSelectionService } from '../service/selectiondata.service';

@Component({
  selector: 'app-cap-select',
  templateUrl: './cap-select.component.html',
  styleUrl: './cap-select.component.css',
})
export class CapSelectComponent implements OnInit, OnDestroy, AfterViewInit {
  listName: string = 'capselect';
  caps: WotlweduCap[];
  capsSub: Subscription;
  capData = new BehaviorSubject<any>(null);
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  @Input() selectMode: boolean = false;
  @ViewChild("capselectlist") capSelectList: ElementRef;

  constructor(
    private capDataService: CapDataService,
    private selectionService: WotlweduSelectionService
  ) {}

  ngOnInit() {
    this.pages.setService(this.capDataService);
    this.filter.setService(this.capDataService);
    this.capsSub = this.capDataService.dataChanged.subscribe((caps) => {
      this.caps = caps;
      this.caps.forEach((c)=>{
        c.isAvailable = true;
        if( this.selectionService.find(c.id)) {
          c.isSelected = true;
        } else {
          c.isSelected = false;
        }
      })
    });
  }

  ngOnDestroy() {
    this.capsSub.unsubscribe();
  }

  ngAfterViewInit() {
    if( this.selectMode === true ) {
      this.capSelectList.nativeElement.style.height = "40svh";
    }
  }

  onSelect(index: number) {
    if( this.caps[index].isSelected ) {
      this.selectionService.removeId( this.caps[index].id);
    } else {
      this.selectionService.push("cap", this.caps[index].id )
    }
    this.caps[index].isSelected = !this.caps[index].isSelected;
  }

  onContextMenu(event, index: number) {
    event.preventDefault();
  }
}
