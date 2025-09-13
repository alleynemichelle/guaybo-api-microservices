// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');
const fs = require('fs');

// Obtener el argumento de línea de comandos para decidir si instalar dependencias
const shouldInstallDeps = process.argv.includes('--install-deps');

const nestCliConfig = JSON.parse(fs.readFileSync('nest-cli.json', 'utf-8'));

const microservices = Object.keys(nestCliConfig.projects);

if (microservices.length === 0) {
    console.error('No microservices found in nest-cli.json.');
    process.exit(1);
}

microservices.forEach((microservice) => {
    console.log(`Building microservice: ${microservice}`);

    try {
        execSync(`nest build ${microservice}`, { stdio: 'inherit' });

        let stackDir, destFile;

        if (microservice.includes('-v2')) {
            const baseName = microservice.replace('-v2', '');
            stackDir = `lib/stacks/${baseName}`;
            destFile = `${stackDir}/main-v2.js`;
        } else {
            stackDir = `lib/stacks/${microservice}`;
            destFile = `${stackDir}/main.js`;
        }

        fs.mkdirSync(stackDir, { recursive: true });
        fs.copyFileSync(`dist/apps/${microservice}/main.js`, destFile);

        if (shouldInstallDeps) {
            execSync('npm install ', { cwd: stackDir, stdio: 'inherit' });
            console.log(`Dependencies installed for microservice in: ${stackDir}`);
        } else {
            console.log('Skipping dependency installation as per the command argument.');
        }

        console.log(
            `Microservice '${microservice}' built, files copied${
                shouldInstallDeps ? ', and dependencies installed' : ''
            }.`,
        );
    } catch (error) {
        console.error(`Error building microservice '${microservice}': ${error}`);
    }
});

try {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Folder "dist" has been successfully deleted.');
} catch (error) {
    console.error(`Error deleting folder "dist": ${error}`);
}

console.log('Process completed.');
