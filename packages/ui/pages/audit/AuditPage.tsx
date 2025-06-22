import {Route, Routes} from "react-router-dom";
import AuditListPage from "./AuditListPage";
import StartAuditPage from "./StartAuditPage";
import {AuditViewPage} from "./AuditViewPage";

export default function AuditPage() {
    return (
        <Routes>
            <Route path="/" element={<AuditListPage/>}/>
            <Route path="start/:auditId" element={<StartAuditPage/>}/>
            <Route path="view/:id" element={<AuditViewPage/>}/>
        </Routes>
    );
}
