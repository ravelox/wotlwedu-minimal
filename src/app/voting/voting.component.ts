import { Component, OnInit } from '@angular/core';
import { WotlweduPageStackService } from '../service/pagestack.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.css'
})
export class VotingComponent implements OnInit{
  
  constructor(
    private pageStack: WotlweduPageStackService,
    private router: Router,
  ){}

  ngOnInit(): void {
    this.pageStack.setRouter( this.router )
  }
  onCancel() {
    this.pageStack.back();
  }

}
