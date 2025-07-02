/**
 * Type représentant les données du formulaire d'inscription.
 *
 * @typedef {Object} RegisterFormData
 * @property {string} firstname - Prénom de l'utilisateur.
 * @property {string} lastname - Nom de famille de l'utilisateur.
 * @property {string} email - Adresse e-mail de l'utilisateur.
 * @property {string} phone_number - Numéro de téléphone de l'utilisateur.
 * @property {string} password - Mot de passe choisi par l'utilisateur.
 * @property {string} confirm_password - Confirmation du mot de passe.
 * @property {string} siren - Numéro SIREN de l'entreprise.
 * @property {string} name_company - Nom de l'entreprise.
 * @property {string} address - Adresse de l'entreprise.
 * @property {string} contact_email - Adresse e-mail de contact de l'entreprise.
 * @property {string} link - Lien vers le site ou une ressource associée.
 */
export type RegisterFormData = {
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
    siren: string;
    name_company: string;
    address: string;
    contact_email: string;
    link: string;
};