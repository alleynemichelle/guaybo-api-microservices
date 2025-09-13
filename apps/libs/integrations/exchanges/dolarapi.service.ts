import axios from 'axios';

import { Injectable } from '@nestjs/common';

const sourceMap: Record<string, string> = {
    oficial: 'official',
    paralelo: 'parallel',
    bitcoin: 'bitcoin',
};

@Injectable()
export class DolarAPIService {
    constructor() {}

    async fetchExchangeRate(): Promise<any> {
        try {
            const { data } = await axios.get('https://ve.dolarapi.com/v1/dolares');
            const currentDate = new Date().toISOString();

            const rates: Record<string, object> = {};
            data.forEach((rate: any) => {
                const source = sourceMap[rate.fuente] || rate.fuente;

                rates[source] = {
                    average: rate.promedio,
                    updatedAt: rate.fechaActualizacion,
                };
            });

            const result = {
                date: currentDate,
                currency: 'VES',
                ...rates,
            };

            return result;
        } catch (error) {
            console.error('Error fetching or saving exchange rates:', error);
            throw new Error('Error fetching or saving exchange rates');
        }
    }
}
