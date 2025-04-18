import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { SearchService, SearchResult } from '../../services/search.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  searchResults$: Observable<SearchResult[]>;
  showResults = false;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.length >= 3) {
          return this.searchService.searchUsers(query);
        }
        return [];
      })
    );
  }

  ngOnInit() {}

  onResultClick(result: SearchResult) {
    this.router.navigate(['/user', result.membershipType, result.membershipId]);
    this.searchControl.setValue('');
    this.showResults = false;
  }

  onFocus() {
    this.showResults = true;
  }

  onBlur() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }
} 