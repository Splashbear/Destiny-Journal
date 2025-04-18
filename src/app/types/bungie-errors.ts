export enum BungieErrorCode {
  Success = 1,
  TransportException = 2,
  UnhandledException = 3,
  NotImplemented = 4,
  SystemDisabled = 5,
  FailedToLoadAvailableLocalesConfiguration = 6,
  ParameterParseFailure = 7,
  ParameterInvalidRange = 8,
  BadRequest = 9,
  AuthenticationInvalid = 10,
  DataNotFound = 11,
  InsufficientPrivileges = 12,
  Duplicate = 13,
  UnknownSqlResult = 14,
  ValidationError = 15,
  ValidationMissingFieldError = 16,
  ValidationInvalidInputError = 17,
  JsonDeserializationError = 18,
  ThrottleLimitExceeded = 19,
  ValidationLinkValueNotAllowed = 20,
  ValidationValueNotAllowed = 21,
  OAuth2Error = 22,
  OAuth2ErrorInvalidToken = 23
}

export interface BungieErrorResponse {
  ErrorCode: BungieErrorCode;
  ThrottleSeconds: number;
  ErrorStatus: string;
  Message: string;
  MessageData: { [key: string]: string };
}

export class BungieApiError extends Error {
  constructor(
    public errorCode: BungieErrorCode,
    public errorStatus: string,
    message: string,
    public throttleSeconds?: number
  ) {
    super(message);
    this.name = 'BungieApiError';
  }
} 