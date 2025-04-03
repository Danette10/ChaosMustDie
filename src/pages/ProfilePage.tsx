import {useEffect, useState} from "react"
import {useUser} from "../context/UserContext"
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const auditLabels: Record<string, string> = {
    ddos: "Détection DDoS",
    web_technologies: "Technologies Web et leurs versions",
    endpoint_discovery: "Découverte d’endpoints",
    bruteforce: "Brute-force",
    sqli: "Injection SQL",
    xss: "Cross-site Scripting (XSS)",
    http_header_identification: "Identification des entêtes HTTP"
}

export default function ProfilePage() {
    const {user} = useUser()
    const [availableAudits, setAvailableAudits] = useState<string[]>([])
    const [selectedAudits, setSelectedAudits] = useState<string[]>([])
    const [loadingAudits, setLoadingAudits] = useState(true)

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/audits`, {withCredentials: true})
            .then(res => {
                setAvailableAudits(res.data.all)
                setSelectedAudits(res.data.selected)
            })
            .finally(() => setLoadingAudits(false))
    }, [])

    if (!user) return <p>Chargement...</p>

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">👤 Mon profil</h2>

            <div className="space-y-2 mb-6">
                <p><strong>Prénom :</strong> {user.first_name}</p>
                <p><strong>Nom :</strong> {user.last_name}</p>
                <p><strong>Email :</strong> {user.email}</p>
                <p><strong>Téléphone :</strong> {user.phone_number || "Non renseigné"}</p>
            </div>

            <h3 className="text-xl font-semibold mb-2">🔒 Préférences d’audit</h3>
            {loadingAudits ? (
                <p>Chargement des audits...</p>
            ) : (
                <ul className="list-disc list-inside space-y-1">
                    {availableAudits.map(audit => (
                        <li key={audit}>
                            {auditLabels[audit] || audit}
                            {selectedAudits.includes(audit) ? " ✅" : " ❌"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
