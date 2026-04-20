const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0,O,I,1

export function generateInviteCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}
