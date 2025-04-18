import { DOCUMENT } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { OAuthService } from 'angular-oauth2-oidc'
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { OAuthBungieService } from './bungie-auth.module'
import { BungieOAuthStorage } from './bungie-auth.storage'
import { map, distinctUntilChanged } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class BungieAuthService {
  private apiKey = 'YOUR_API_KEY' // Replace with your actual API key
  private accessToken$ = new BehaviorSubject<string | null>(null)
  private refreshToken$ = new BehaviorSubject<string | null>(null)
  private expiresIn$ = new BehaviorSubject<number | null>(null)

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(OAuthBungieService) private oAuthService: OAuthService,
    private route: ActivatedRoute,
    private storage: BungieOAuthStorage
  ) {
    this.oAuthService.setStorage(new BungieOAuthStorage())
    this.oAuthService.configure({
      issuer: 'https://www.bungie.net/en/OAuth/Authorize',
      loginUrl: 'https://www.bungie.net/en/OAuth/Authorize',
      tokenEndpoint: 'https://www.bungie.net/Platform/App/OAuth/token/',
      redirectUri: environment.bungie.redirect,
      clientId: environment.bungie.clientId,
      responseType: 'code',
      scope: '',
      dummyClientSecret: environment.bungie.clientSecret,
      oidc: false,
      strictDiscoveryDocumentValidation: false,
      showDebugInformation: true
    })
    this.oAuthService.tokenValidationHandler = new JwksValidationHandler()
    this.loadTokensFromStorage()
    this.tryLogin()
  }

  get hasValidAccessToken$(): Observable<boolean> {
    return this.accessToken$.pipe(
      map(token => !!token && !this.isTokenExpired())
    )
  }

  private loadTokensFromStorage(): void {
    const accessToken = localStorage.getItem('bungie_access_token')
    const refreshToken = localStorage.getItem('bungie_refresh_token')
    const expiresIn = localStorage.getItem('bungie_expires_in')

    if (accessToken) {
      this.accessToken$.next(accessToken)
    }
    if (refreshToken) {
      this.refreshToken$.next(refreshToken)
    }
    if (expiresIn) {
      this.expiresIn$.next(parseInt(expiresIn, 10))
    }
  }

  private isTokenExpired(): boolean {
    const expiresIn = this.expiresIn$.value
    if (!expiresIn) {
      return true
    }
    return Date.now() >= expiresIn
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    localStorage.setItem('bungie_access_token', accessToken)
    localStorage.setItem('bungie_refresh_token', refreshToken)
    localStorage.setItem('bungie_expires_in', (Date.now() + expiresIn * 1000).toString())

    this.accessToken$.next(accessToken)
    this.refreshToken$.next(refreshToken)
    this.expiresIn$.next(Date.now() + expiresIn * 1000)
  }

  clearTokens(): void {
    localStorage.removeItem('bungie_access_token')
    localStorage.removeItem('bungie_refresh_token')
    localStorage.removeItem('bungie_expires_in')

    this.accessToken$.next(null)
    this.refreshToken$.next(null)
    this.expiresIn$.next(null)
  }

  getAccessToken(): string | null {
    return this.accessToken$.value
  }

  getRefreshToken(): string | null {
    return this.refreshToken$.value
  }

  async tryLogin() {
    this.route.queryParams.subscribe(async (url) => {
      if (url.state && url.state === localStorage.getItem('bungie-nonce')) {
        await this.oAuthService.tryLoginCodeFlow()
        if (this.oAuthService.hasValidAccessToken()) {
          this.oAuthService.setupAutomaticSilentRefresh()
          this.accessToken$.next(this.oAuthService.getAccessToken())
          this.refreshToken$.next(this.oAuthService.getRefreshToken())
        }
      }
    })
  }

  async login() {
    await this.oAuthService.createAndSaveNonce()
    const nonce = localStorage.getItem('bungie-nonce')
    const redirectUri = encodeURIComponent(environment.bungie.redirect)
    this.document.location.href = `https://www.bungie.net/en/OAuth/Authorize?response_type=code&client_id=${environment.bungie.clientId}&state=${nonce}&redirect_uri=${redirectUri}`
  }

  logout() {
    this.oAuthService.logOut()
    this.accessToken$.next(null)
    this.refreshToken$.next(null)
    this.expiresIn$.next(null)
  }

  getApiKey(): string {
    return this.apiKey
  }
}
