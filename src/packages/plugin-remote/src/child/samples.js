const add = (x) => x + 1;
const multiplyByTwo = (x) => x * 2;
const compose =
    (...fns) =>
    (x) =>
        fns.reduce((acc, fn) => fn(acc), x);
const addAndMultiply = compose(multiplyByTwo, add);
console.log(addAndMultiply(3));
