// One bridge, two independently observable latches. No optional-route dependency.
export function riverInput(value){
 const valid=Number.isInteger(value)&&value>=0&&value<=9;
 return {valid,output:valid?4*value-3:null,correct:valid&&4*value-3===17};
}
export function riverOrder(order){
 if(!['fg','gf'].includes(order))return null;
 const intermediate=order==='fg'?2*2+1:3*2-2;
 return {intermediate,output:order==='fg'?3*intermediate-2:2*intermediate+1,correct:order==='fg'};
}
export function riverStatus(solved){
 return solved.has('river-crossing')?'Jambatan selamat · lintas ke destinasi':solved.has('river-composition')?'Dua pengunci aktif · jambatan disediakan':solved.has('river-input')?'Pengunci 1 terbuka · uji susunan pengunci 2':'Jambatan terkunci · dua pengunci diperlukan';
}
