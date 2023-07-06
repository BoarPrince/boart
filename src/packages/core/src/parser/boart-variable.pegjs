START = _ "$" _ "{" _ @NAME @SCOPE? @QUALIFIER? @SELECTOR?  @PIPE? "}"

/************* NAME **************/
NAME = name:$TOKEN 
		{ return {'type': 'variable', 'value': name} }

/************* SCOPE **************/
SCOPE = _ "@" _ scope:$SCOPETOKEN
                { return {'type': 'scope', 'value': scope} }

/************* QUALIFIER **************/
QUALIFIER = _ ":" _ name:$TOKEN parameter:(_ ":" _ @PARAMETER )* _ 
                { return {'type': 'qualifier', 'value': name, 'para': parameter} }

/************* PIPE **************/
PIPE = _ "|" _ name:$TOKEN _ parameter:(_ ":" _ @PARAMETER )* _ 
	        { return {'type': 'pipe', 'value': name, 'para': parameter} }

/************* SELECTOR **************/
SELECTOR = _ start:("##" / "#") _  selector:( 
		_ delim:DELIMITER _ sel:SELECTORS _ { sel.optional = delim.isOptional; return sel;}
        / _ @SELECTORS _
)+ { selector[0].optional = start === '##'; return  {'type': 'selector', 'value' : selector}; }

SELECTORS = SELECTOR_SIMPLE_INDEX
        / SELECTOR_WITH_STARTINDEX
        / SELECTOR_WITH_ENDINDEX
        / SELECTOR_WITH_START_AND_ENDINDEX
        / SELECTOR_WITH_LISTINDEX
        / SELECTOR_WITH_WILDCARD
        / SELECTOR_SIMPLE

SELECTOR_SIMPLE = selector_simple:$TOKEN 
	{ return {'type': 'simple', 'value': selector_simple}; }
    
SELECTOR_SIMPLE_INDEX = selector_simple_index:$TOKEN _ "[" _ index:$INDEXTOKEN _ "]" 
	{ return {'type': 'with_index', 'value': selector_simple_index, 'index': parseInt(index)}; }
    
SELECTOR_WITH_LISTINDEX = selector_list_index:$TOKEN _ "[" _ index:($INDEXTOKEN)|..,_","_| _ "]"
	{ return {'type': 'list', 'value': selector_list_index, 'indexes': index.map(i => parseInt(i))}; }
    
SELECTOR_WITH_STARTINDEX = selector_with_startindex:$TOKEN _ "[" _ start:$INDEXTOKEN _ ":" _ "]"
	{ return {'type': 'start', 'value': selector_with_startindex, 'start': parseInt(start)}; }

SELECTOR_WITH_ENDINDEX = selector_with_endindex:$TOKEN _ "[" _ ":" _ end:$("-"? _ $INDEXTOKEN) _ "]"
	{ return {'type': 'end', 'value': selector_with_endindex, 'end': parseInt(end.replace(/\s/g, '')) }; }

SELECTOR_WITH_START_AND_ENDINDEX = selector_with_start_endindex:$TOKEN _ "[" _ start:$INDEXTOKEN _ ":" _ end:$("-"? _ $INDEXTOKEN) _ "]"
	{ return {'type': 'start_end', 'value': selector_with_start_endindex, 'start': parseInt(start), 'end': parseInt(end.replace(/\s/g, ''))}; }
    
SELECTOR_WITH_WILDCARD = selector_with_wildcard:$TOKEN _ "[" _ "*" _ "]"
	{ return {'type': 'wildcard', 'value' : selector_with_wildcard}; }

/************* TOKEN **************/
TOKEN = [a-zA-Z0-9_-]+

/************* INDEX **************/
INDEXTOKEN = [0-9]+

/************** SCOPE **************
        g: global
        l: local
        t: test
        s: step
***********************************/
SCOPETOKEN = [glts]

/********** WHITESPACES ***********/
_ = [ \t]*

/********** DELIMITER ***********/
DELIMITER = delim:("." / "?.") 
        { return {'isOptional' : delim === '.' ? false : true} }

/********** PARAMETER ***********/
PARAMETER = para:(
          "\"" @$([^"]+) "\"" // with double quotes
          / "'" @$([^']+) "'" // with single quotes
          / $TOKEN            // no quotes
		) { return para.replace(/\\n/g, '\n').replace(/\\t/g, '\t') }