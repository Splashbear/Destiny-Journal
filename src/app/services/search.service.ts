import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SearchResult {
  displayName: string;
  membershipId: string;
  membershipType: number;
  bungieGlobalDisplayName: string;
  bungieGlobalDisplayNameCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly BUNGIE_API_URL = 'https://www.bungie.net/Platform';

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<SearchResult[]> {
    return this.http.get<any>(`${this.BUNGIE_API_URL}/User/Search/GlobalName/${query}/0/`)
      .pipe(
        map(response => {
          if (response.Response && response.Response.searchResults) {
            return response.Response.searchResults.map((result: any) => ({
              displayName: result.bungieGlobalDisplayName,
              membershipId: result.membershipId,
              membershipType: result.membershipType,
              bungieGlobalDisplayName: result.bungieGlobalDisplayName,
              bungieGlobalDisplayNameCode: result.bungieGlobalDisplayNameCode
            }));
          }
          return [];
        })
      );
  }
} 