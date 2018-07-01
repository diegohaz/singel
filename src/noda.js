const args = process.argv
args.forEach((arg, i) => {
  process.stdout.write(`${i} ${arg}\n`)
});