import process from 'process'

export const msg = (s : any) => process.stderr.write(s)
export const print = (s : any) =>  process.stdout.write(s)