// https://peggyjs.org/online.html

/********************************************/
/************* V A R I A B L E **************/
/********************************************/
START_VARIABLE
        = _ name:NAME scope:SCOPE? qualifier:QUALIFIER? datascope:DATASCOPE? selector:SELECTOR? default_Operator:DEFAULT? pipes:PIPES? _
        { return { name: name, scope: scope, qualifier: qualifier, datascope: datascope, selectors: selector && selector.selectors || [], default: default_Operator, pipes: pipes } }

/********************************************/
/*************** A C T I O N  ***************/
/********************************************/
START_ACTION
        = _ name:NAME scope:SCOPE? qualifier:QUALIFIER? datascope:DATASCOPE? selector:SELECTOR?
        { return { name: name, scope: scope, qualifier: qualifier, datascope: datascope, selectors: selector && selector.selectors || [] } }

/********************************************/
/**************** V A L U E *****************/
/********************************************/
START_VALUE
        = _ scope:SCOPE? name:NAME selector:SELECTOR?
        { return { scope: scope, qualifier: name, selectors: selector && selector.selectors || [] } }

/************* NAME **************/
NAME
        = name:$TOKEN
	{ return {'value': name} }

/************* SCOPE **************/
SCOPE
        = _ "@" _ scope:$SCOPETOKEN
        { return {'value': scope, 'location': location()} }

/************* DATASCOPE **************/
DATASCOPE
        = _ "::" _ datascope:$TOKEN
        { return {'value': datascope, 'location': location()} }

/************* PIPE **************/
DEFAULT
        = _ operator:DEFAULT_OPERATOR _ value:(STRING / $DEFAULTVALUE)
	{ return {'value': value, 'operator': operator, 'location': location()} }

DEFAULT_OPERATOR
        = ":-" { return 'Default'; }
         / ":=" { return 'DefaultAssignment'; }

/************* QUALIFIER **************/
QUALIFIER
        = _ start:("?:" /":") _ name:$TOKEN parameter:(_ ":" _ @PARAMETER )* _
        { return {'value': name, 'paras': parameter, 'optional': start === '?:'} }

/************* PIPE **************/
PIPES
        = pipes:(_ "|" _ @SINGLE_PIPE)*

SINGLE_PIPE
        = _ name:$TOKEN _ paras:PIPE_PARAMETER _
	{ return {name, paras} }

PIPE_PARAMETER
        = parameter:(_ ":" _ @PARAMETER )*

/************* SELECTOR **************/
SELECTOR
        = _ start:("?#" / "#") _
                selectors:(_ delim:DELIMITER _ sel:SELECTORS _
                { sel.optional = delim.isOptional; return sel;}
                  / _ @SELECTORS _)+
                {
                  selectors.match = text();
                  selectors[0].optional = start === '?#';
                  return { selectors };
                }

SELECTORS
        = SELECTOR_SIMPLE_INDEX
        / SELECTOR_WITH_STARTINDEX
        / SELECTOR_WITH_ENDINDEX
        / SELECTOR_WITH_START_AND_ENDINDEX
        / SELECTOR_WITH_LISTINDEX
        / SELECTOR_WITH_WILDCARD
        / SELECTOR_SIMPLE

SELECTOR_SIMPLE
        = selector_simple:$TOKEN
	{ return {'type': 'simple', 'value': selector_simple}; }

SELECTOR_SIMPLE_INDEX
        = selector_simple_index:$TOKEN? _ "[" _ index:$INDEXTOKEN _ "]"
	{ return {'type': 'with_index', 'value': selector_simple_index, 'index': parseInt(index)}; }

SELECTOR_WITH_LISTINDEX
        = selector_list_index:$TOKEN? _ "[" _ index:($INDEXTOKEN)|..,_","_| _ "]"
	{ return {'type': 'list', 'value': selector_list_index, 'indexes': index.map(i => parseInt(i))}; }

SELECTOR_WITH_STARTINDEX
        = selector_with_startindex:$TOKEN? _ "[" _ start:$INDEXTOKEN _ ":" _ "]"
	{ return {'type': 'start', 'value': selector_with_startindex, 'start': parseInt(start)}; }

SELECTOR_WITH_ENDINDEX
        = selector_with_endindex:$TOKEN? _ "[" _ ":" _ end:$("-"? _ $INDEXTOKEN) _ "]"
	{ return {'type': 'end', 'value': selector_with_endindex, 'end': parseInt(end.replace(/\s/g, '')) }; }

SELECTOR_WITH_START_AND_ENDINDEX
        = selector_with_start_endindex:$TOKEN? _ "[" _ start:$INDEXTOKEN _ ":" _ end:$("-"? _ $INDEXTOKEN) _ "]"
	{ return {'type': 'start_end', 'value': selector_with_start_endindex, 'start': parseInt(start), 'end': parseInt(end.replace(/\s/g, ''))}; }

SELECTOR_WITH_WILDCARD
        = selector_with_wildcard:$TOKEN? _ "[" _ "*" _ "]"
	{ return {'type': 'wildcard', 'value' : selector_with_wildcard}; }

/************* INDEX **************/
INDEXTOKEN
        = [0-9]+

/************* INDEX **************/
DEFAULTVALUE
        = [^{}|]+

/************** SCOPE **************
        g: global
        l: local
        t: test
        s: step
***********************************/
SCOPETOKEN
        = [glts]

/********** WHITESPACES ***********/
_
        = [ \t]*

/********** DELIMITER ***********/
DELIMITER
        = delim:("." / "?.")
        { return { 'isOptional' : delim === '?.' } }

/************* Parameter **************/
PARAMETER
        = para:(STRING      // with single quotes
               / $TOKEN)    // no quotes

/************* String **************/
STRING
        = '"' chars:DoubleStringCharacter* '"' { return chars.join(''); }
        / "'" chars:SingleStringCharacter* "'" { return chars.join(''); }

DoubleStringCharacter
        = !('"' / "\\") char:. { return char; }
        / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
        = !("'" / "\\") char:. { return char; }
        / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
        = "'"
        / '"'
        / "\\"
        / "$"     { return "$";   }
        / "b"     { return "\b";   }
        / "f"     { return "\f";   }
        / "n"     { return "\n";   }
        / "r"     { return "\r";   }
        / "t"     { return "\t";   }
        / "v"     { return "\x0B"; }

/************* TOKEN **************/
 TOKEN
  	= [a-zA-Z0-9_][a-zA-Z0-9-_]*
