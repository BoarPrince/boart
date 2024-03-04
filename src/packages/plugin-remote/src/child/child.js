// const fs = require('fs');

// // child.js
// process.on('message', (message) => {
//     try {
//         const data = listening(message);
//         process.send({ data });
//     } catch (error) {
//         process.send({ error: error.message || error });
//     }
// });

// process.on('uncaughtException', (error) => {
//     process.send({ error: error.message || error });
// });

function listening(message) {
    // console.error(`Message from main.js: ${message}`);
    // throw new Error('etwas passiert');
    // console.log('re-order-recursive', reorderRecursive('hallor'));
    // console.log('reverse-only-characters', reverseStringWithoutMovingSpecialCharacters('h?allo#r'));
    console.log('# steps of shortest path', startShortestPath());
    // fizzBuzz2(20);
    // palindrom2('otto');
    // palindrom3('lotto');
    // findMissingNumber2(1, 2, 3, 4, 6, 7, 8, 10, 11, 18);
    // anagramGrouping('eat', 'tea', 'tan', 'ate', 'nat', 'bat');
    // highestProduct2(1, 2, 5, -6, 3, -2);
    // longestPrefix('vorgehen', 'vorrang');
    // textChange('abcdefghijklmnopqrstuvwqyz');
    // textChangeLeftRigh('abcdefghijklmnopqrstuvwqyz');
    // fizzBuzz(20);
    // checkPalindrom('ottor');
    // checkPalindrom1('otto');
    // anagram('act2', 'Cat1');
    // findingMissingNumber1(1, 2, 3, 4, 5, 6, 8);
    // highestProduct([1, 2, 5, -6, 3]);
    // longestSequence(100, 4, 200, 5, 1, 3, 2);
    // longestSequence1(100, 4, 200, 5, 1, 2, 3);
    // stringCompression('aabcccccaaa');
    // changeOnlyWords('hallo wie geht es dir');
    // inplaceChange([...'hallor']);
    // changeOrderOnlyText('abc!!de');
    // flattenArray([0, [1, 2, [3, 4, 5]]]);
    // fibonacci(50);
    // textChangeFromTo('abcdefghijklmnopqrstuvwqyz', 0, 5);

    return { hallo: 'world' };
}

/**
 *
 */
function shortestPath(matrix, start, end) {
    const directions = [
        [0, 1], // right
        [1, 0], // down
        [0, -1], // left
        [-1, 0] // up
    ];

    const countRows = matrix.length;
    const countCols = matrix[0].length;
    const gonePaths = new Set(start);
    // x, y, count of steps
    const pathQueue = [[start[0], start[1], 0]];

    while (pathQueue.length > 0) {
        const [x, y, steps] = pathQueue.shift();

        if (x === end[0] && y === end[1]) {
            return steps;
        }

        for (const [dirX, dirY] of directions) {
            const newDirX = x + dirX;
            const newDirY = y + dirY;

            if (
                newDirX >= 0 && //
                newDirX < countRows &&
                newDirY >= 0 &&
                newDirY < countCols &&
                matrix[newDirX][newDirY] === 0 &&
                !gonePaths.has([newDirX, newDirY])
            ) {
                pathQueue.push([newDirX, newDirY, steps + 1]);
                gonePaths.add([newDirX, newDirX]);
            }
        }
    }

    return -1;
}

function startShortestPath() {
    const matrix = [
        [0, 0, 0, 0, 1],
        [0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0]
    ];

    const start = [0, 0];
    const end = [4, 4];

    return shortestPath(matrix, start, end);
}

/**
 *
 */
function reverseStringWithoutMovingSpecialCharacters(text) {
    const isAlphaNumeric = (char) => char.match(/[a-zA-Z0-9]/);
    const buffer = new Array(text.length);

    for (let index = 0; index < text.length; index++) {
        const rightIndex = text.length - 1 - index;
        const char = text.charAt(rightIndex);
        if (isAlphaNumeric(char)) {
            buffer[index] = char;
        } else {
            buffer[rightIndex] = char;
        }
    }

    return buffer.join('');
}

/**
 *
 */
function reorderRecursive(text) {
    if (text.length === 1) {
        return text;
    }

    return text.charAt(text.length - 1) + reorderRecursive(text.substring(0, text.length - 1));
}

/**
 *
 */
function longestPrefix(...textList) {
    const prefixBuffer = [''];

    for (let prefixLength = 2; true; prefixLength++) {
        const prefixes = textList.map((text) => text.split('').slice(0, prefixLength).join(''));
        const prefix = prefixes.reduce((prev, current) => {
            return prev === current ? current : '';
        }, prefixes[0]);

        if (!!prefix) {
            prefixBuffer.push(prefix);
        } else {
            break;
        }
    }

    console.log('longest prefix:', prefixBuffer.sort((a, b) => b.length - a.length)[0]);
}

/**
 *
 */
function highestProduct2(...numbers) {
    const highestIndex = numbers.length - 1;
    const orderedNumbers = numbers.sort();

    const rightProduct = orderedNumbers[highestIndex] * orderedNumbers[highestIndex - 1] * orderedNumbers[highestIndex - 2];
    const leftProduct = orderedNumbers[0] * orderedNumbers[1] * orderedNumbers[highestIndex];

    console.log('hightest Product', Math.max(rightProduct, leftProduct));
}

/**
 *
 */
function anagramGrouping(...textList) {
    const group = new Map();

    for (let index = 0; index < textList.length; index++) {
        const text = textList[index];
        const txt = textList[index].toLowerCase().split('').sort().join('');
        const list = group.has(txt) ? group.get(txt) : group.set(txt, []).get(txt);
        list.push(text);
    }

    console.log('anagram grouping', Array.from(group.values()));
}

/**
 *
 */
function findMissingNumber2(...numbers) {
    const missingNumbers = [];
    let offset = 0;
    for (let index = 0; index < numbers.length; index++) {
        const nextNumber = index + 1 + offset;
        if (numbers[index] !== nextNumber) {
            missingNumbers.push(nextNumber);
            offset++;
        }
    }
    console.log('missing numbers', missingNumbers.join(', '));
}

/**
 *
 */
function palindrom3(text) {
    const check = () => {
        if (text.length % 2) {
            return false;
        }
        const textCI = text.toLowerCase();
        for (const leftIndex = 0; leftIndex <= Math.abs(textCI.length / 2); leftIndex++) {
            const rightIndex = text.length - 1 - leftIndex;
            if (textCI[leftIndex] !== textCI[rightIndex]) {
                return false;
            }
        }
        return true;
    };
    console.log('is palindrom?', text, check());
}

/**
 *
 */
function palindrom2(text) {
    const leftToRight = text.toLowerCase();
    const rightToLeft = text.split('').reverse().join('').toLowerCase();

    console.log('is palindrom?', text, leftToRight === rightToLeft);
}

/**
 *
 */
function fizzBuzz2(n) {
    const buffer = [];
    const FIZZBUZZ = 3;
    const BUZZ = 2;
    const FIZZ = 1;

    for (let index = 1; index <= n; index++) {
        let marker = (!(index % 3) ? FIZZ : 0) | (!(index % 5) ? BUZZ : 0);

        switch (marker) {
            case FIZZBUZZ:
                buffer.push('FizzBuzz');
                break;
            case BUZZ:
                buffer.push('Buzz');
                break;
            case FIZZ:
                buffer.push('Fizz');
                break;
            default:
                buffer.push(index);
        }
    }
    console.log('FizzBuzz', buffer.join('.'));
}

/**
 *
 */
function longestSequence1(...numbers) {
    let leftNumber = numbers[0];
    const sequenceLength = [{ length: 1 }];
    const lengthBuffer = [];

    for (let index = 1; index < numbers.length; index++) {
        if (leftNumber === numbers[index] - 1) {
            sequenceLength.at(-1).length++;
        } else {
            sequenceLength.push({ length: 1 });
        }
        leftNumber = numbers[index];
    }

    console.log('longest', sequenceLength.sort((a, b) => b.length - a.length)[0]);
}

function checkPalindrom1(text) {
    const buffer = [];
    for (let index = text.length - 1; index >= 0; index--) {
        buffer.push(text.charAt(index));
    }

    if (text === buffer.join('')) {
        console.log('palindrom', 'yes');
    } else {
        console.log('palindrom', 'no');
    }
}

function anagram1(text1, text2) {
    if (text1.length != text2.length) {
        console.log('no anagram', text1, text2);
    }

    const text1Buffer1 = text1.split('').sort().join('');
    const text1Buffer2 = text2.split('').sort().join('');

    console.log('anagram', text1Buffer1 === text1Buffer2, text1, text2);
}

/**
 *
 */
function textChangeLeftRigh(text) {
    let leftIndex = 0;
    let rightIndex = text.length - 1;
    const buffer = text.split('');

    while (leftIndex < rightIndex) {
        const char = buffer[leftIndex];
        buffer[leftIndex] = buffer[rightIndex];
        buffer[rightIndex] = char;
        leftIndex++;
        rightIndex--;
    }

    console.log('textChangeLeftRigh', buffer.join(''));
}

/**
 *
 */
function textChangeFromTo(text, from, to) {
    const buffer = text.split('');

    for (let index = from; index < to; index++) {
        buffer[index] = text[to - index - 1];
    }

    console.log('text change from to', from, to, buffer.join(''));
}

/**
 *
 */
function fibonacci(length) {
    let fibonacci = [1, 1];
    let qotient = [1];

    for (let count = 0; count < length - 2; count++) {
        fibonacci.push(fibonacci.at(-1) + fibonacci.at(-2));
        qotient.push((fibonacci.at(-1) / fibonacci.at(-2)).toFixed(5));
    }

    console.log('fibonacci', fibonacci.join(','));
    console.log('qotient', qotient.join(', '));
}

/**
 *
 */
function flattenArray(array) {
    const flat = (arr) => arr.reduce((a, b) => (Array.isArray(b) ? [...a, ...flat(b)] : [...a, b]), []);
    console.log(flat(array));
}

/**
 *
 */
function changeOrderOnlyText(text) {
    let leftIndex = 0;
    let rightIndex = text.length - 1;

    const buffer = text.split('');
    while (leftIndex < rightIndex) {
        if (!buffer[leftIndex].match(/[a-zA-Z]/)) {
            leftIndex++;
        } else if (!buffer[rightIndex].match(/[a-zA-Z]/)) {
            rightIndex--;
        } else {
            const char = buffer[leftIndex];
            buffer[leftIndex] = buffer[rightIndex];
            buffer[rightIndex] = char;

            leftIndex++;
            rightIndex--;
        }
    }

    console.log('change order only text', buffer.join(''));
}

/**
 *
 */
function inplaceChange(textBuffer) {
    const length = textBuffer.length - 1;
    for (let index = 0; index < Math.abs(length / 2); index++) {
        const highIndex = length - index;
        const highChar = textBuffer[highIndex];
        textBuffer[highIndex] = textBuffer[index];
        textBuffer[index] = highChar;
    }
    console.log(textBuffer);
}

function changeOnlyWords(text) {
    const words = text.split(/\s+/);
    // const reversed = text.split('').reverse().join('');
    const reversed = words.map((word) => word.split('').reverse().join('')).join(' ');
    console.log(reversed);
}

function textChange(text) {
    let newText = [];

    for (let index = 0; index < text.length; index++) {
        const char = text[text.length - 1 - index];
        newText.push(char);
    }
    console.log(newText.join(''));
}

function fizzBuzz(n) {
    const buffer = [];
    for (let index = 1; index <= n; index++) {
        const mod3 = !(index % 3);
        const mod5 = !(index % 5);

        if (mod3 && mod5) {
            buffer.push('FizzBuzz');
        } else if (mod3 || mod5) {
            buffer.push('Fizz');
        } else {
            buffer.push(index);
        }
    }

    console.log(buffer.join('.'));
}

/**
 *
 */
function checkPalindrom(text) {
    const buffer = [];
    for (let index = text.length - 1; index >= 0; index--) {
        buffer.push(text[index]);
    }

    if (buffer.join('') === text) {
        console.log('yes', text);
    } else {
        console.log('no', text);
    }
}

/**
 *
 */
function anagram(text1, text2) {
    if (text1.length != text2.length) {
        console('no anagram', text1, text2);
        return;
    }

    text1 = text1.toLowerCase();
    text2 = text2.toLowerCase();

    text1 = text1.split('').sort().join('');
    text2 = text2.split('').sort().join('');

    if (text1 === text2) {
        console.log('yes anagram', text1, text2);
    } else {
        console.log('no anagram', text1, text2);
    }
}

/**
 *
 */
function findingMissingNumber(...numbers) {
    for (let index = 0; index < numbers.length; index++) {
        if (numbers[index] !== index + 1) {
            console.log('missing number is ', index + 1);
            return;
        }
    }
}

function findingMissingNumber1(...numbers) {
    for (let index = 1; index < numbers.length; index++) {
        const number = numbers[index - 1];
        const nextNumber = numbers[index];
        if (number !== nextNumber - 1) {
            console.log('missing', number + 1);
            return;
        }
    }
}

/**
 *
 */
function highestProduct(numbers) {
    const sortedNumbers = numbers.sort((a, b) => a - b);
    const length = numbers.length;

    const prodHigh = sortedNumbers[length - 1] * sortedNumbers[length - 2] * sortedNumbers[length - 3];
    const prodLow = sortedNumbers[0] * sortedNumbers[1] * sortedNumbers[length - 1];

    const highestProduct = Math.max(prodHigh, prodLow);

    console.log('highest', highestProduct);
}

/**
 *
 */
function longestSequence(...numbers) {
    numbers = numbers.sort((a, b) => a - b);

    const buffer = [0];
    let sequenceLength = 1;

    let currentNumber = numbers[0];

    for (let index = 1; index < numbers.length; index++) {
        if (currentNumber === numbers[index] - 1) {
            sequenceLength++;
        } else {
            buffer.push(sequenceLength);
            sequenceLength = 0;
        }
        currentNumber = numbers[index];
    }

    sequenceLength = buffer.sort((a, b) => b - a)[0];
    console.log('longest', sequenceLength);
}

/**
 *
 */
function stringCompression(text) {
    const buffer = [];

    buffer.push({ char: text[0], count: 1 });

    for (let index = 1; index < text.length; index++) {
        let followerChar = text[index];

        if (followerChar === text[index - 1]) {
            buffer.at(-1).count++;
        } else {
            buffer.push({ char: text[index], count: 1 });
        }
    }

    console.log('compression: ', buffer.map((c) => `${c.char}${c.count}`).join(''));
}

listening('');
