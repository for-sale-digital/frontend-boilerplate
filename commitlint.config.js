module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-empty': [2, 'never'],
        'references-empty': [2, 'never'],
        'type-enum': [2, 'always', ['chore', 'docs', 'feat', 'fix']]
    },
    parserPreset: {
        parserOpts: {
            issuePrefixes: ['TECH-']
        }
    }
};
