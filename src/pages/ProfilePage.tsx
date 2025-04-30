import {useEffect, useRef, useState} from "react"
import {useUser} from "../context/UserContext"
import axiosInstance from "../utils/axiosInstance"

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

    const handleToggleAudit = (audit: string) => {
        setSelectedAudits(prev =>
            prev.includes(audit)
                ? prev.filter(a => a !== audit)
                : [...prev, audit]
        )
    }

    const hasFetched = useRef(false)

    useEffect(() => {
        if (!user || hasFetched.current) return
        hasFetched.current = true

        axiosInstance.get("/profile/audits")
            .then(res => {
                setAvailableAudits(res.data.all)
                setSelectedAudits(res.data.selected)
            })
            .finally(() => setLoadingAudits(false))
    }, [user])


    const handleSaveAudits = async () => {
        try {
            await axiosInstance.post("/profile/audits", {
                selected: selectedAudits
            })
            alert("Préférences enregistrées ✅")
        } catch (err) {
            console.error(err)
            alert("Erreur lors de la sauvegarde ❌")
        }
    }

    if (!user) return <p>Chargement...</p>

    console.log(selectedAudits)
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
                <>
                    <ul className="list-none space-y-2">
                        {availableAudits.map(audit => (
                            <li key={audit} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedAudits.includes(audit)}
                                    onChange={() => handleToggleAudit(audit)}
                                    className="checkbox checkbox-sm"
                                />
                                <span>{auditLabels[audit] || audit}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={handleSaveAudits}
                    >
                        💾 Sauvegarder mes préférences
                    </button>
                </>
            )}
        </div>
    )
}
