import {Dispatch, SetStateAction} from "react";
import {PasswordInput, Progress, Stack, TextInput} from "@mantine/core";
import {RegisterFormData} from "ui/types/RegisterForm";

/**
 * Props for the RegisterForm component.
 *
 * @interface Props
 * @property {"auditor" | "company"} type - Specifies the type of user (auditor or company).
 * @property {RegisterFormData} form - The current state of the registration form data.
 * @property {Dispatch<SetStateAction<RegisterFormData>>} setForm - Function to update the form state.
 */
type Props = {
    type: "auditor" | "company";
    form: RegisterFormData;
    setForm: Dispatch<SetStateAction<RegisterFormData>>;
};

/**
 * RegisterForm Component
 *
 * This component renders a registration form with fields for user information.
 * It dynamically adjusts the fields based on the user type (auditor or company).
 *
 * @param {Props} props - Props for the component.
 * @returns {JSX.Element} The rendered registration form.
 */
export default function RegisterForm({type, form, setForm}: Props) {
    /**
     * Handles input changes in the form fields.
     * Updates the form state with the new values.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    /**
     * Calculates the strength of the password based on various criteria.
     *
     * @param {string} password - The password to evaluate.
     * @returns {number} The calculated password strength (0-100).
     */
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
        return strength;
    };

    // Checks if the password confirmation matches the original password.
    const isConfirmValid = form.password === form.confirm_password;

    return (
        <Stack>
            {/* Input field for the user's first name */}
            <TextInput name="firstname" label="Prénom" value={form.firstname} onChange={handleChange} required/>

            {/* Input field for the user's last name */}
            <TextInput name="lastname" label="Nom" value={form.lastname} onChange={handleChange} required/>

            {/* Input field for the user's email */}
            <TextInput name="email" label="Email" type="email" value={form.email} onChange={handleChange} required/>

            {/* Input field for the user's phone number */}
            <TextInput name="phone_number" label="Téléphone" type="tel" value={form.phone_number} onChange={handleChange} required/>

            {/* Input field for the user's password */}
            <PasswordInput name="password" label="Mot de passe" value={form.password} onChange={handleChange} required/>

            {/* Progress bar to display password strength */}
            <Progress value={getPasswordStrength(form.password)} color={getPasswordStrength(form.password) === 100 ? "green" : "red"}/>

            {/* Input field for confirming the user's password */}
            <PasswordInput name="confirm_password" label="Confirmer le mot de passe" value={form.confirm_password} onChange={handleChange} error={!isConfirmValid && form.confirm_password !== ""} required/>

            {/* Additional fields for company type users */}
            {type === "company" && (
                <>
                    {/* Input field for the company's SIREN */}
                    <TextInput name="siren" label="SIREN" value={form.siren} onChange={handleChange} required/>

                    {/* Input field for the company's name */}
                    <TextInput name="name_company" label="Nom de l'entreprise" value={form.name_company} onChange={handleChange} required/>

                    {/* Input field for the company's address */}
                    <TextInput name="address" label="Adresse" value={form.address} onChange={handleChange} required/>

                    {/* Input field for the company's contact email */}
                    <TextInput name="contact_email" label="Email de contact" type="email" value={form.contact_email} onChange={handleChange} required/>

                    {/* Input field for the company's website link */}
                    <TextInput name="link" label="Lien du site" value={form.link} onChange={handleChange} required/>
                </>
            )}
        </Stack>
    );
}