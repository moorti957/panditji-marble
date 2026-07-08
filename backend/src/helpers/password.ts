import bcrypt from "bcryptjs";

export const hash = (pwd: string): string =>
  bcrypt.hashSync(pwd, 10);

export const compare = (
  pwd: string,
  hash: string
): boolean =>
  bcrypt.compareSync(pwd, hash);