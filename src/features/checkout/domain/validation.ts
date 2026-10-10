import type { Address, CardFormData, Customer, ScoopSelection } from "../types";
import { onlyDigits } from "./masks";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const BR_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export function isValidCpf(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

export function isValidPhone(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0, 2)) < 11) return false;
  return d.length === 10 || d[2] === "9";
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
export const isValidCep = (value: string) => onlyDigits(value).length === 8;

export function preferencesError(selection: ScoopSelection): string | null {
  if (selection.metal === null) return "Escolha a categoria para continuar.";
  if (selection.wearsRings === null) return "Conte se você gosta de anéis para continuar.";
  if (selection.wearsRings && !selection.ringSize?.trim())
    return "Informe o tamanho do seu anel para continuar.";
  if (selection.allowsMalePieces === null)
    return "Conte se pode conter peças masculinas para continuar.";
  if (selection.allowsMalePieces && selection.maleMetal === null)
    return "Escolha a categoria das peças masculinas para continuar.";
  if (selection.allowsPiercing === null)
    return "Conte se pode conter piercing de furo para continuar.";
  if (selection.allowsPiercing && selection.piercingLocations.length === 0)
    return "Escolha onde pode conter piercing de furo para continuar.";
  return null;
}

export function validateCustomer(c: Customer): FieldErrors<Customer> {
  const errors: FieldErrors<Customer> = {};
  if (c.fullName.trim().split(/\s+/).length < 2) errors.fullName = "Informe seu nome e sobrenome.";
  if (!isValidPhone(c.whatsapp))
    errors.whatsapp = "Informe um WhatsApp com DDD, ex.: (19) 99999-9999.";
  if (!isValidEmail(c.email)) errors.email = "Confira o e-mail, ex.: nome@email.com.";
  if (!isValidCpf(c.cpf)) errors.cpf = "CPF inválido. Confira os números.";
  return errors;
}

export function validateAddress(a: Address): FieldErrors<Address> {
  const errors: FieldErrors<Address> = {};
  if (!isValidCep(a.zipCode)) errors.zipCode = "O CEP precisa ter 8 números.";
  if (!a.street.trim()) errors.street = "Informe a rua.";
  if (!a.number.trim()) errors.number = "Informe o número (ou S/N).";
  if (!a.district.trim()) errors.district = "Informe o bairro.";
  if (!a.city.trim()) errors.city = "Informe a cidade.";
  if (!BR_STATES.some((uf) => uf === a.state)) errors.state = "Selecione o estado.";
  return errors;
}

function passesLuhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function validateCard(card: CardFormData, now = new Date()): FieldErrors<CardFormData> {
  const errors: FieldErrors<CardFormData> = {};
  const number = onlyDigits(card.number);
  if (number.length < 13 || !passesLuhn(number)) errors.number = "Confira o número do cartão.";
  if (card.holderName.trim().length < 3) errors.holderName = "Informe o nome como está no cartão.";
  const [mm, yy] = card.expiry.split("/").map(Number);
  const expiresAt = mm && yy ? new Date(2000 + yy, mm, 1) : null;
  if (!expiresAt || !mm || mm > 12 || expiresAt <= now)
    errors.expiry = "Validade inválida (MM/AA).";
  if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = "O CVV tem 3 ou 4 números.";
  return errors;
}

export const hasErrors = <T>(errors: FieldErrors<T>) => Object.keys(errors).length > 0;
