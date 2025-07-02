import {Dispatch, SetStateAction} from "react";
import {PasswordInput, Progress, Stack, TextInput} from "@mantine/core";
import {RegisterFormData} from "ui/types/RegisterForm";

type Props = {
    type: "auditor" | "company";
    form: RegisterFormData;
    setForm: Dispatch<SetStateAction<RegisterFormData>>;
};

export default function RegisterForm({type, form, setForm}: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
        return strength;
    };

    const isConfirmValid = form.password === form.confirm_password;

    return (
        <Stack>
            <TextInput name="firstname" label="Prénom" value={form.firstname} onChange={handleChange} required/>
            <TextInput name="lastname" label="Nom" value={form.lastname} onChange={handleChange} required/>
            <TextInput name="email" label="Email" type="email" value={form.email} onChange={handleChange} required/>
            <TextInput name="phone_number" label="Téléphone" type="tel" value={form.phone_number}
                       onChange={handleChange} required/>
            <PasswordInput name="password" label="Mot de passe" value={form.password} onChange={handleChange} required/>
            <Progress value={getPasswordStrength(form.password)}
                      color={getPasswordStrength(form.password) === 100 ? "green" : "red"}/>
            <PasswordInput name="confirm_password" label="Confirmer le mot de passe" value={form.confirm_password}
                           onChange={handleChange} error={!isConfirmValid && form.confirm_password !== ""} required/>
            {type === "company" && (
                <>
                    <TextInput name="siren" label="SIREN" value={form.siren} onChange={handleChange} required/>
                    <TextInput name="name_company" label="Nom de l'entreprise" value={form.name_company}
                               onChange={handleChange} required/>
                    <TextInput name="address" label="Adresse" value={form.address} onChange={handleChange} required/>
                    <TextInput name="contact_email" label="Email de contact" type="email" value={form.contact_email}
                               onChange={handleChange} required/>
                    <TextInput name="link" label="Lien du site" value={form.link} onChange={handleChange} required/>
                </>
            )}
        </Stack>
    );
}
