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
    / _ db _ arg1:word _ { pc++; return {ins:'db',arg1} }

label =
    label:name ':' { return { name:label } }

name = label:[a-zA-Z0-9_]* { return label.join(""); }
    
instruction
    = cls { return {ins:'cls'}; }
    / ret { return {ins:'ret'}; }
    / ins:jp _ arg1:(name / word) { return {ins,arg1}; }
    / ins:jp _ arg1:v0 _ ',' _ arg2:dword { return {ins,arg1,arg2}; }
    / ins:call _ arg1:(name / word) { return {ins,arg1}; }
    / ins:se _ arg1:vreg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:se _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:sne _ arg1:vreg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:vreg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:ireg _ ',' _ arg2:(name / dword) { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:vreg _ ',' _ arg2:dt { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:vreg _ ',' _ arg2:k { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:dt _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:st _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:f _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:b _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:ind _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:ld _ arg1:vreg _ ',' _ arg2:ind { return {ins,arg1,arg2}; }
    / ins:add _ arg1:vreg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:sub _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:or _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:and _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:xor _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:add _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:sub _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:shr _ arg1:vreg { return {ins,arg1}; }
    / ins:shl _ arg1:vreg { return {ins,arg1}; }
    / ins:subn _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:sne _ arg1:vreg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }
    / ins:rnd _ arg1:vreg _ ',' _ arg2:word { return {ins,arg1,arg2}; }
    / ins:drw _ arg1:vreg _ ',' _ arg2:vreg _ ',' _ arg3:nibble { return {ins,arg1,arg2,arg3}; }
    / ins:skp _ arg1:vreg { return {ins,arg1}; }
    / ins:sknp _ arg1:vreg { return {ins,arg1}; }
    / ins:add _ arg1:ireg _ ',' _ arg2:vreg { return {ins,arg1,arg2}; }

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
and = ('and' / 'AND') { return 'and'; }

v0 = ('v0' / 'V0') { return {typ: 'vreg', val: 0} }
vreg = ('v' / 'V') num:[0-9a-f] { return {typ: 'vreg', val: parseInt(num,16)} }
ireg = ('I' / 'i') { return { typ: 'ireg' } }
dt = ('DT' / 'dt') { return { typ: 'dt' } }
st = ('ST' / 'st') { return { typ: 'st' } }
k = ('K' / 'k') { return { typ: 'k' } }
f = ('F' / 'f') { return { typ: 'f' } }
b = ('B' / 'b') { return { typ: 'b' } }
ind = ('[' ireg ']') { typ: 'ind' }

db = ('db' / 'DB')

nibble = dec_nibble / hex_nibble
word = dec_word / hex_word
dword = dec_dword / hex_dword

dec_nibble = num:(dec+) {
    return {typ: 'int', val: parseInt(num.join("")) & 0xf};
}

hex_nibble = '$' num:(hex+) {
    return {typ: 'int', val: parseInt(num.join(""), 16) & 0xf};
}


dec_word = num:(dec+) {
    return {typ: 'int', val: parseInt(num.join("")) & 0xff};
}

hex_word = '$' num:(hex+) {
    return {typ: 'int', val: parseInt(num.join(""), 16) & 0xff};
}

dec_dword = num:(dec+) {
    return {typ: 'int', val: parseInt(num.join("")) & 0xffff};
}

hex_dword = '$' num:(hex+) {
    return {typ: 'int', val: parseInt(num.join(""), 16) & 0xffff};
}

hex = [0-9a-fA-F]
dec = [0-9]

_ = [ \t\r\n]*

