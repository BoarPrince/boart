expect.extend({
    toBeConstructorName(received, expected) {
        return received.constructor.name === expected.constructor.name
            ? {
                  pass: false,
                  message: `Expected ${received} not to be a power of ${expected}`
              }
            : {
                  pass: false,
                  message: `AAExpected ${received} not to be a power of ${expected}`
              };
    }
});
