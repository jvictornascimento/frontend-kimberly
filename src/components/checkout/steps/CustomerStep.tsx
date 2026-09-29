import { maskCpf, maskPhone } from "@/features/checkout/domain/masks";
import { hasErrors, validateCustomer } from "@/features/checkout/domain/validation";
import { useTouched } from "@/features/checkout/hooks/useTouched";
import { goToStep, updateCustomer } from "@/features/checkout/state/checkout.store";
import type { Customer } from "@/features/checkout/types";
import { PrimaryButton, StepHeader, TextButton, TextField } from "../ui";

export function CustomerStep({ customer }: { customer: Customer }) {
  const errors = validateCustomer(customer);
  const { touch, visible, submit } = useTouched<keyof Customer>();
  const err = (f: keyof Customer) => (visible(f) ? errors[f] : undefined);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
        if (!hasErrors(errors)) goToStep("delivery");
      }}
    >
      <TextButton onClick={() => goToStep("scoop")}>← Voltar</TextButton>
      <div className="mt-4">
        <StepHeader title="Seus dados" description="Sem cadastro e sem senha. Só o necessário para o seu pedido." />
      </div>
      <div className="mt-6 grid gap-4">
        <TextField
          id="fullName"
          label="Nome completo"
          value={customer.fullName}
          onChange={(v) => updateCustomer({ fullName: v })}
          onBlur={() => touch("fullName")}
          error={err("fullName")}
          autoComplete="name"
          maxLength={100}
        />
        <TextField
          id="whatsapp"
          label="WhatsApp"
          value={customer.whatsapp}
          onChange={(v) => updateCustomer({ whatsapp: maskPhone(v) })}
          onBlur={() => touch("whatsapp")}
          error={err("whatsapp")}
          hint="Usamos para confirmar o pedido e enviar o vídeo do seu Scoop."
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(00) 00000-0000"
        />
        <TextField
          id="email"
          label="E-mail"
          type="email"
          value={customer.email}
          onChange={(v) => updateCustomer({ email: v })}
          onBlur={() => touch("email")}
          error={err("email")}
          autoComplete="email"
          maxLength={255}
        />
        <TextField
          id="cpf"
          label="CPF"
          value={customer.cpf}
          onChange={(v) => updateCustomer({ cpf: maskCpf(v) })}
          onBlur={() => touch("cpf")}
          error={err("cpf")}
          hint="Necessário para emissão do pagamento e envio."
          inputMode="numeric"
          placeholder="000.000.000-00"
        />
      </div>
      <PrimaryButton type="submit" className="mt-8">
        Continuar
      </PrimaryButton>
    </form>
  );
}
