module.exports = {
    testEnvironment: 'node',
    projects: [
        {
            displayName: 'billings',
            testMatch: ['<rootDir>/apps/billings/test/**/*.spec.ts'], // Asegura que Jest encuentre los archivos de prueba en src
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
            moduleNameMapper: {
                'apps/(.*)$': '<rootDir>/apps/$1',
            },
        },
    ],
};
