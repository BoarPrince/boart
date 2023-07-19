import { VariableParser } from './VariableParser';

const parser = new VariableParser();

console.log(
    // JSON.stringify(parser.parse('${adsf@t:aaaa:"bb1\n":bb2#aa[3].bb.cc.dd[1].ee[*].ff[3:]?.gg[0:-4].hh[1,2,32] | pipe:4:3}'), null, '  ')
    // JSON.stringify(parser.parse('${aaa:bbbb:"d\\"d3"}'), null, '  ')
    // JSON.stringify(parser.parse('${aaa:bbbb#a.b.c}'), null, '  ')
    JSON.stringify(parser.parse('${aaa:bbbb}'), null, '  ')
);

// const result = parse('') as ASTVariable;
