START
      = __ unit:((UNIT)+ / UNIT_DESC)
      { return unit }

/********** UNIT ***********/
UNIT "'-- <unit> --'"
      = _ [\-]+ _ unit:$TOKEN _ [\-]+ _ "\n"+ desc:UNIT_DESC
      { return { unit, desc } }

/********** UNIT DESCRIPTION ***********/
UNIT_DESC
      = id:ID examples1:EXAMPLES? desc:DESCRIPTIONS examples2:EXAMPLES?
      { return { id, desc, examples:examples1 ?? examples2 } }

/**************** ID *****************/
ID "': id :'"
      = _ ":" _ "id" _ ":" _ id:$TOKEN _ "\n"+
      { return id; }

/********** DESCRIPTIONS ***********/
DESCRIPTIONS "': description :'"
      = DESCRIPTION_HEADER lines:LINES
       { return lines; }

DESCRIPTION_HEADER "': description :'"
      = _ ":" _ "description" _ ":" _ "\n"

/********** EXAMPLES ***********/
EXAMPLES "': examples :'"
      = EXAMPLES_HEADER example:(EXAMPLE)+
        { return example; }

EXAMPLES_HEADER "': examples :'"
    	= _ ":" _ "examples" _ ":" _ "\n"+

/********** EXAMPLE ***********/
EXAMPLE
      = EXAMPLE_HEADER title:TITLE text:TEXT codes:CODES?
        { return { title, text, codes }; }

EXAMPLE_HEADER "':: example :'"
      = _ "::" _ "example" _ ":" _ "\n"+

/********** TITLE ***********/
TITLE "'::: title :'"
      = _ ":::" _ "title" _ ":" _ title:$TOKEN _ "\n"+
      { return title; }

/********** TEXT ***********/
TEXT
      = TEXT_HEADER lines:LINES
      { return lines; }

TEXT_HEADER "'::: text :'"
    	= _ ":::" _ "text" _ ":" _ "\n"

/********** CODES ***********/
CODES
      = CODES_HEADER code:(CODE)+
      { return code; }

CODES_HEADER "'::: codes :'"
    	= _ ":::" _ "codes" _ ":" _ "\n"+

/********** CODE ***********/
CODE
      = CODE_HEADER title:CODE_TITLE type:CODE_TYPE position:CODE_POSITION code:CODE_LINES
        { return { title, type, position, code }; }

CODE_HEADER "':::: code :'"
    	= _ "::::" _ "code" _ ":" _ "\n"+

CODE_TITLE "'::::: title :'"
      = _ ":::::" _ "title" _ ":" _ title:$TOKEN _ "\n"+
      { return title; }

CODE_TYPE "'::::: type:'"
      = _ ":::::" _ "type" _ ":" _ type:("json" / "javascript") _ "\n"+
      { return type; }

CODE_POSITION "'::::: position :'"
      = _ ":::::" _ "position" _ ":" _ position:("before" / "after") _ "\n"+
      { return position; }

CODE_LINES
      = CODE_LINES_HEADER lines:LINES
      { return lines; }

CODE_LINES_HEADER "'::::: code :'"
    	= _ ":::::" _ "code" _ ":" _ "\n"

/********** LINES ***********/
LINES
      = lines:(LINE)+

LINE
      = line:$(ANY) "\n"
      { return line; }

ANY
    	=  !(EXAMPLES_HEADER / EXAMPLE_HEADER / DESCRIPTION_HEADER / CODES_HEADER / CODE_HEADER / UNIT) [^\n]*

/********** TOKEN ***********/
TOKEN
  	= [a-zA-Z0-9-_]+

/********** WHITESPACES ***********/
_ "whitespaces"
      = [ \t]*

__ "whitespaces (including new line)"
      = [ \t\n]*
