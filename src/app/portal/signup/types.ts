export const LIMITE_DEMO = 20;

export type SignupState = {
  error?: string;
  success?: { email: string; senha: string };
};
