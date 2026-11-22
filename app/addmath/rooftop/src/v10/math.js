// Pure mathematics; animation and input bindings consume the same calculations.
export const f=x=>2*x+1;
export const g=x=>3*x-2;
export const h=x=>4*x-3;
export function compose(input,reverse=false) {
 const middle=reverse?g(input):f(input);
 return {input,middle,output:reverse?f(middle):g(middle),notation:reverse?'f(g(x))':'g(f(x))',order:reverse?'g → f':'f → g'};
}
export const inverse=y=>[1,3,5,7].includes(y)?(y-1)/2:null;
