import {useUser} from "../context/UserContext"
import {useEffect, useState} from "react"
import axiosInstance from "../utils/axiosInstance"
import {Loader} from "../components/Loader";

export const DashboardPage = () => {
    const { user } = useUser()
    const [auditors, setAuditors] = useState([])
    const [auditTypes, setAuditTypes] = useState<string[]>([])
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.user_type === "company") {
            Promise.all([
                axiosInstance.get("/profile/auditors"),
                axiosInstance.get("/profile/audits"),
            ])
                .then(([auditorsRes, auditsRes]) => {
                    setAuditors(auditorsRes.data)
                    setAuditTypes(auditsRes.data.all)
                })
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [user])

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    const resetFilters = () => setSelectedTypes([])

    const filteredAuditors = selectedTypes.length > 0
        ? auditors.filter(auditor =>
            selectedTypes.every(type => auditor.audit_types.includes(type))
        )
        : auditors

    const getBadgeClass = (type: string) => {
        switch (type) {
            case "SQLI":
                return "badge badge-error badge-outline"
            case "DDOS":
                return "badge badge-warning badge-outline"
            case "BRUTEFORCE":
                return "badge badge-info badge-outline"
            case "WEB_TECHNOLOGIES":
                return "badge badge-success badge-outline"
            case "ENDPOINT_DISCOVERY":
                return "badge badge-secondary badge-outline"
            default:
                return "badge badge-outline"
        }
    }

    if (loading) {
        return (
            <Loader/>
        )
    }

    return (
        <div className="min-h-screen bg-base-200 text-gray-900 px-4">
            <div className="max-w-6xl mx-auto py-6 space-y-8">
                <h1 className="text-2xl font-bold">Bienvenue, {user?.first_name} 👋</h1>

                <div className="card bg-white shadow-md p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Filtres par type d'audit</h2>
                    </div>

                    <div className="dropdown btn m-1" tabIndex={0}>
                        <label>Choisir les types</label>
                        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box z-[1]">
                            {auditTypes.map(type => (
                                <li key={type}>
                                    <label className="label cursor-pointer justify-start gap-2 px-2 py-1">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => toggleType(type)}
                                        />
                                        <span className="label-text">{type}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {selectedTypes.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {selectedTypes.map(type => (
                                <div key={type} className={getBadgeClass(type)}>
                                    {type}
                                </div>
                            ))}
                            <button
                                onClick={resetFilters}
                                className="btn btn-xs btn-outline btn-error ml-2"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">Auditeurs disponibles</h2>
                        <button className="btn btn-primary">Voir tous les auditeurs</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAuditors.slice(0, 5).map(auditor => (
                            <div key={auditor.id} className="card bg-white text-gray-900 shadow-md p-4">
                                <h3 className="font-bold">{auditor.name}</h3>
                                <p className="text-sm text-gray-500">{auditor.email}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {auditor.audit_types.map(audit_type => (
                                        <div className={getBadgeClass(audit_type)} key={audit_type}>
                                            {audit_type}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredAuditors.length === 0 && (
                            <p className="text-gray-500">Aucun auditeur ne correspond à ces filtres.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
