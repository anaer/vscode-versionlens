export default {
  preFetchSuggestions: {
    ".npmrc": "//registry.npmjs.example/:_authToken=${NPM_AUTH}",
    ".npmrc-env": "NPM_AUTH=12345678",
  }
}