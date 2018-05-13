import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Ssp } from './ssp';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class SSPService {

  private heroesUrl = 'api/sspList';  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET sspList from the server */
  getSSPList (): Observable<Ssp[]> {
    return this.http.get<Ssp[]>(this.heroesUrl)
      .pipe(
        tap(sspList => this.log(`fetched sspList`)),
        catchError(this.handleError('getSSPList', []))
      );
  }

  /** GET ssp by id. Return `undefined` when id not found */
  getSSPNo404<Data>(id: number): Observable<Ssp> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Ssp[]>(url)
      .pipe(
        map(sspList => sspList[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} ssp id=${id}`);
        }),
        catchError(this.handleError<Ssp>(`getSSP id=${id}`))
      );
  }

  /** GET ssp by id. Will 404 if id not found */
  getSSP(id: number): Observable<Ssp> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Ssp>(url).pipe(
      tap(_ => this.log(`fetched ssp id=${id}`)),
      catchError(this.handleError<Ssp>(`getSSP id=${id}`))
    );
  }

  /* GET sspList whose name contains search term */
  searchSSPList(term: string): Observable<Ssp[]> {
    if (!term.trim()) {
      // if not search term, return empty ssp array.
      return of([]);
    }
    return this.http.get<Ssp[]>(`api/sspList/?name=${term}`).pipe(
      tap(_ => this.log(`found sspList matching "${term}"`)),
      catchError(this.handleError<Ssp[]>('searchSSPList', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new ssp to the server */
  addSSP (ssp: Ssp): Observable<Ssp> {
    return this.http.post<Ssp>(this.heroesUrl, ssp, httpOptions).pipe(
      tap((ssp: Ssp) => this.log(`added ssp w/ id=${ssp.id}`)),
      catchError(this.handleError<Ssp>('addSSP'))
    );
  }

  /** DELETE: delete the ssp from the server */
  deleteSSP (ssp: Ssp | number): Observable<Ssp> {
    const id = typeof ssp === 'number' ? ssp : ssp.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Ssp>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted ssp id=${id}`)),
      catchError(this.handleError<Ssp>('deleteSSP'))
    );
  }

  /** PUT: update the ssp on the server */
  updateSSP (ssp: Ssp): Observable<any> {
    return this.http.put(this.heroesUrl, ssp, httpOptions).pipe(
      tap(_ => this.log(`updated ssp id=${ssp.id}`)),
      catchError(this.handleError<any>('updateSSP'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a SSPService message with the MessageService */
  private log(message: string) {
    this.messageService.add('SSPService: ' + message);
  }
}
