const common = require('./common.webpack')
const {resolve} = require('path')

module.exports = common({
    mode: 'production',
    entry: {
        "gen-ollama" : resolve(__dirname, '../entries/gen-ollama.ts'),
        "gen-gemini" : resolve(__dirname, '../entries/gen-gemini.ts'),
        "gen-openai" : resolve(__dirname, '../entries/gen-openai.ts'),
    },
    output: {
        path: resolve(__dirname, '../dist'),
        filename: '[name].js'
    },
})