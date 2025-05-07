import {useUser} from "../context/UserContext"
import {useEffect, useState} from "react"
import axiosInstance from "../utils/axiosInstance"
import {Loader} from "../components/Loader"

export const ProfilePage = () => {
    const {user} = useUser()
    const [allAudits, setAllAudits] = useState<string[]>([])
    const [selectedAudits, setSelectedAudits] = useState<string[]>([])
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")
    const [showAlert, setShowAlert] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axiosInstance.get("/profile/audits")
            .then(res => {
                setAllAudits(res.data.all)
                setSelectedAudits(res.data.selected)
            })
            .catch(err => {
                console.error("Erreur lors du chargement des audits :", err)
                setError("Erreur lors du chargement des types d'audit")
                setSuccess("")
            })
            .finally(() => setLoading(false))
    }, [])

    const handleToggle = (auditType: string) => {
        setSelectedAudits(prev =>
            prev.includes(auditType)
                ? prev.filter(a => a !== auditType)
                : [...prev, auditType]
        )
    }

    const handleSave = () => {
        axiosInstance.post("/profile/audits", {selected: selectedAudits})
            .then(() => {
                setSuccess("Préférences enregistrées avec succès ✅")
                setError("")
                setShowAlert(true)
            })
            .catch(err => {
                console.error("Erreur lors de la sauvegarde :", err)
                setError("Erreur lors de l'enregistrement ❌")
                setSuccess("")
                setShowAlert(true)
            })
    }

    useEffect(() => {
        if (success || error) {
            setShowAlert(true)
            const timer = setTimeout(() => setShowAlert(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [success, error])

    if (loading) return <Loader/>

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Profil</h1>
            <p>Bienvenue {user?.first_name} 👋</p>

            {error && showAlert && <div className="alert alert-error mb-2">{error}</div>}
            {success && showAlert && <div className="alert alert-success mb-2">{success}</div>}

            <h2 className="mt-6 text-lg font-semibold">Types d'audit souhaités</h2>
            <div className="mt-2 space-y-2">
                {allAudits.map(type => (
                    <label key={type} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={selectedAudits.includes(type)}
                            onChange={() => handleToggle(type)}
                            className="checkbox checkbox-sm"
                        />
                        <span>{type}</span>
                    </label>
                ))}
            </div>

            <button
                onClick={handleSave}
                className="mt-4 btn btn-primary"
            >
                Enregistrer
            </button>
        </div>
    )
}
