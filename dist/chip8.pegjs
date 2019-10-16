{
    const labels = {};
    let pc = 0x200;

    function nnn(val) {
        return (val & 0xfff).toString(16).slice(-3);
    }
}

start =
    statements: statement+ { return {labels,statements}; }

statement
    = _ label:label _ { labels[label.name] = pc; return label; }
    / _ instruction:instruction _ { pc+=2; return instruction; }

label =
    label:name ':' { return { name:label } }

name = label:[a-zA-Z0-9_]* { return label.join(""); }
    
instruction
    = sys
    / cls
    / ret
    / ins:jp _ dest:(name / word) { return {ins,dest}; }
    / ins:call _ dest:(name / word) { return {ins,dest}; }
    / ins:se _ arg1:reg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:sne _ arg1:reg _ ',' _ arg2:word { return {ins,arg1,arg2}; } 
    / ins:se _ arg1:reg _ ',' _ arg2:reg { return {ins,arg1,arg2}; } 
    / ins:ld _ arg1:reg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:sub _ arg1:reg _ ',' _ arg2:reg { return {ins,arg1,arg2}; }

cls = ('cls' / 'CLS') { return 'cls'; }
ret = ('ret' / 'RET') { return 'ret'; }
sys = ('sys' / 'SYS') { return 'sys'; }
jp = ('jp' / 'JP') { return 'jp'; }
call = ('call' / 'CALL') { return 'call'; }
se = ('se' / 'SE') { return 'se'; }
sne = ('sne' / 'SNE') { return 'sne'; }
ld = ('ld' / 'LD') { return 'ld'; }
add = ('add' / 'ADD') { return 'add'; }
or = ('or' / 'OR') { return 'or'; }
xor = ('xor' / 'XOR') { return 'xor'; }
sub = ('sub' / 'SUB') { return 'sub'; }
shr = ('shr' / 'SHR') { return 'shr'; }
subn = ('subn' / 'SUBN') { return 'subn'; }
shl = ('shl' / 'SHL') { return 'shl'; }
rnd = ('rnd' / 'RND') { return 'rnd'; }
drw = ('drw' / 'DRW') { return 'drw'; }
skp = ('skp' / 'SKP') { return 'skp'; }
sknp = ('sknp' / 'SKNP') { return 'sknp'; }

reg = ('v' / 'V') num:[0-9a-f] { return ['reg', 'v' + num]; }

word = dec_word / hex_word
dword = dec_dword / hex_dword

dec_word = num:(dec+) {
    const val = parseInt(num.join(""));
    return ['int', val & 0xff];
}

hex_word = '$' num:(hex+) {
    const val = parseInt(num.join(""), 16);
    return ['int', val & 0xff];
}

dec_dword = num:(dec+) {
    const val = parseInt(num.join(""));
    return ['int', val & 0xffff];
}

hex_dword = '$' num:(hex+) {
    const val = parseInt(num.join(""), 16);
    return ['int', val & 0xffff];
}

hex = [0-9a-fA-F]
dec = [0-9]

_ = [ \t\r\n]*

