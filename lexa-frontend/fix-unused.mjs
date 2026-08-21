import { Project } from 'ts-morph';

const project = new Project({
    tsConfigFilePath: 'tsconfig.app.json',
});

const sourceFiles = project.getSourceFiles('src/pages/settings/tabs/**/*.tsx');

for (const sourceFile of sourceFiles) {
    sourceFile.fixUnusedIdentifiers();
    sourceFile.saveSync();
}

console.log('Unused identifiers removed successfully!');
