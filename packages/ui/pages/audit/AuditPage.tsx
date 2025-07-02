import {Route, Routes} from "react-router-dom";
import AuditListPage from "./AuditListPage";
import StartAuditPage from "./StartAuditPage";
import {AuditViewPage} from "./AuditViewPage";

/**
 * Composant AuditPage.
 *
 * Ce composant gère les routes liées aux audits dans l'application.
 * Il définit les différentes pages accessibles pour les audits, notamment :
 * - La liste des audits.
 * - Le démarrage d'un audit.
 * - La vue détaillée d'un audit.
 *
 * @returns {JSX.Element} Le composant AuditPage contenant les routes des audits.
 */
export default function AuditPage() {
    return (
        <Routes>
            {/* Route pour afficher la liste des audits */}
            <Route path="/" element={<AuditListPage/>}/>

            {/* Route pour démarrer un audit spécifique */}
            <Route path="start/:auditId" element={<StartAuditPage/>}/>

            {/* Route pour afficher les détails d'un audit spécifique */}
            <Route path="view/:id" element={<AuditViewPage/>}/>
        </Routes>
    );
}