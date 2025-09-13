export interface IExchangeRateSource {
    getLatestExchangeRate(): Promise<any>;
}
