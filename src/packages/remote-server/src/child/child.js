// child.js
process.on('message', (message) => {
    try {
        const data = listening(message);
        process.send({ data });
    } catch (error) {
        process.send({ error: error.message || error });
    }
});

process.on('uncaughtException', (error) => {
    process.send({ error: error.message || error });
});

function listening(message) {
    // console.error(`Message from main.js: ${message}`);
    // throw new Error('etwas passiert');

    // textChange('abcdefghijklmnopqrstuvwqyz');
    // fizzBuzz(20);
    // checkPalindrom('ottor');
    // anagram('act2', 'Cat1');
    // findingMissingNumber(1, 2, 3, 4, 5, 6, 8);
    // highestProduct([1, 2, 5, -6, 3]);
    // longestSequence(100, 4, 200, 5, 1, 3, 2);
    // stringCompression('aabcccccaaa');
    // changeOnlyWords('hallo wie geht es dir');
    // inplaceChange([...'hallor']);
    changeOrderOnlyText('abc!!de');

    return { hallo: 'world' };
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
