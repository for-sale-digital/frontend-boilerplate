module.exports = {
    build: {
        banner: '/* <%= pkg.name %> <%= pkg.version %> */\n/* Generated on: <%= timestamp %> */\n\n',
        basename: 'myproject',
        sources: {
            sass: './src/scss/',
            js: './src/js/'
        },
        targets: {
            css: './public/css/',
            js: './public/js/'
        }
    },

    static: {
        sources: {
            css: [],
            js: []
        },
        targets: {
            css: './public/css/libs/',
            js: './public/js/libs/'
        }
    }
};
