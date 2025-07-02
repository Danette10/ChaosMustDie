/**
 * Déclaration de module pour les fichiers CSS modules.
 *
 * Cette déclaration permet de typer les fichiers CSS modules dans un projet TypeScript.
 * Elle associe chaque classe CSS à une chaîne de caractères, facilitant l'utilisation
 * des styles dans les composants React.
 *
 * @module '*.module.css'
 * @property {Object.<string, string>} classes - Objet contenant les classes CSS.
 * @exports classes - Les classes CSS exportées par le fichier.
 */
declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}