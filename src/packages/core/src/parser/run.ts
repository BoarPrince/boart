import { parse } from './parser-table';
import { ASTTable } from './ast/ASTTable';

console.log(JSON.stringify(parse('aaaaa'), null, ' '));
// console.log(JSON.stringify(parse('${aaaaa}'), null, ' '));
// console.log(JSON.stringify(parse('${store:aaaaa#b.c}'), null, ' '));
// console.log(JSON.stringify(parse('bbbbbb:dddd'), null, ' '));
// console.log(JSON.stringify(parse('ccccccc:dddd#sel'), null, ' '));
console.log(JSON.stringify(parse('ccccccc:dddd:eeeee#sel'), null, ' '));
console.log(JSON.stringify(parse('ccccccc:dddd:eeeee#sel1.sel2.sel3'), null, ' '));
console.log(JSON.stringify(parse('ccccccc:dddd:eeeee#sel1.sel2.sel3@header'), null, ' '));
console.log(JSON.stringify(parse('ccccccc:dddd:eeeee@header#sel1.sel2.sel3'), null, ' '));
// console.log(
//     JSON.stringify(
//         parse('ccccccc:dddd:eeeee@asdfasf#sel1[3].sel2[ 4 ].sel3[*] . sel4 [- 3 : ].sel5[?].sel6[4?].sel7[4, 3,2,6].sel8'),
//         null,
//         ' '
//     )

const result = parse('') as ASTTable;
// );
