module.exports = {
    "testEnvironment": "node",
    "roots": [
        "./test"
    ],
    "transform": {
      "^.+\\.jsx?$": "babel-jest"
    },
    "testRegex": "(\\.|/)(test|spec)\\.(ts|js)x?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "setupFiles": [
        "./test/setup.js"
    ]
}