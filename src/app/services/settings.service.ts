import { Injectable } from '@angular/core'
import { UserInfoCard } from 'bungie-api-ts/user'
import { BehaviorSubject } from 'rxjs'

interface UserLanguage {
  language?: string
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _dark: boolean
  public activeProfiles: BehaviorSubject<UserInfoCard[]>
  public userLang: UserLanguage
  public userLangObs: BehaviorSubject<UserLanguage>
  public dark: BehaviorSubject<boolean>

  constructor() {
    if (localStorage.getItem('gt.DARK') !== null) {
      this._dark = JSON.parse(localStorage.getItem('gt.DARK') || 'false')
    } else {
      this._dark = true
    }

    this.activeProfiles = new BehaviorSubject<UserInfoCard[]>([])
    this.dark = new BehaviorSubject<boolean>(this._dark)

    this.userLang = {
      language: 'en',
    }
    if (JSON.parse(localStorage.getItem('gt.LANGUAGE') || 'null')) {
      this.userLang = JSON.parse(localStorage.getItem('gt.LANGUAGE') || '{"language":"en"}')
    } else if (navigator.language) {
      switch (navigator.language.substr(0, 2)) {
        case 'fr':
          this.userLang.language = 'fr'
          break
        case 'es':
          this.userLang.language = 'es'
          break
        case 'de':
          this.userLang.language = 'de'
          break
        case 'it':
          this.userLang.language = 'it'
          break
        case 'ja':
          this.userLang.language = 'ja'
          break
        case 'pt':
          this.userLang.language = 'pt-br'
          break
        case 'ru':
          this.userLang.language = 'ru'
          break
        case 'pl':
          this.userLang.language = 'pl'
          break
        case 'ko':
          this.userLang.language = 'pl'
          break
        case 'zh':
          this.userLang.language = 'zh-cht'
          break
      }
      switch (navigator.language) {
        case 'es-mx':
          this.userLang.language = 'es-mx'
          break
        case 'zh-chs':
          this.userLang.language = 'zh-chs'
          break
      }
    }
    this.userLangObs = new BehaviorSubject<UserLanguage>(this.userLang)
  }

  toggleDark(): void {
    this._dark = !this._dark
    this.dark.next(this._dark)
    localStorage.setItem('gt.DARK', JSON.stringify(this._dark))
  }

  set setLanguage(language: string) {
    this.userLang.language = language
    localStorage.setItem('gt.LANGUAGE', JSON.stringify(this.userLang))
    this.userLangObs.next(this.userLang)
  }
}
