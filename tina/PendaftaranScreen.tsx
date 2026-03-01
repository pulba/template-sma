// tina/PendaftaranScreen.tsx
import React, { useState, useEffect, useCallback } from "react";

type Registrant = {
    id: number;
    kode_pendaftaran: string;
    tahun_ppdb: string;
    nama_lengkap: string;
    email: string;
    nomor_hp: string;
    status: string | null;
    created_at: string;
};

const STATUS_OPTIONS = ["pending", "review", "approved", "rejected"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<string, string> = {
    approved: "background:#d1fae5;color:#065f46;",
    rejected: "background:#fee2e2;color:#991b1b;",
    review: "background:#dbeafe;color:#1e40af;",
    pending: "background:#fef9c3;color:#854d0e;",
};

function getStatusStyle(status: string | null): string {
    return STATUS_STYLES[status ?? "pending"] ?? STATUS_STYLES.pending;
}

export function PendaftaranScreen() {
    const [registrants, setRegistrants] = useState<Registrant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<number | null>(null);
    const [filterYear, setFilterYear] = useState<string>("Semua");
    const [filterStatus, setFilterStatus] = useState<string>("Semua");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/pendaftaran/list");
            if (!res.ok) throw new Error("Gagal memuat data");
            const json = await res.json();
            if (json.success) {
                setRegistrants(json.data);
            } else {
                setError("Tidak ada data pendaftaran");
            }
        } catch (e: any) {
            setError(e.message ?? "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (id: number, status: Status) => {
        if (!confirm(`Ubah status menjadi "${status}"?`)) return;
        setUpdating(id);
        try {
            const res = await fetch(
                `/api/pendaftaran/update-status?id=${id}&status=${status}`
            );
            // The update-status API redirects on success (302), which fetch follows
            // After success, re-fetch fresh data
            await fetchData();
        } catch {
            alert("Gagal update status");
        } finally {
            setUpdating(null);
        }
    };

    // Derived data
    const years = [
        "Semua",
        ...Array.from(new Set(registrants.map((r) => r.tahun_ppdb))).sort(),
    ];

    const filtered = registrants.filter((r) => {
        const matchYear =
            filterYear === "Semua" || r.tahun_ppdb === filterYear;
        const matchStatus =
            filterStatus === "Semua" ||
            (r.status ?? "pending") === filterStatus;
        const matchSearch =
            searchQuery === "" ||
            r.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.kode_pendaftaran.toLowerCase().includes(searchQuery.toLowerCase());
        return matchYear && matchStatus && matchSearch;
    });

    const stats = {
        total: registrants.length,
        pending: registrants.filter((r) => !r.status || r.status === "pending").length,
        review: registrants.filter((r) => r.status === "review").length,
        approved: registrants.filter((r) => r.status === "approved").length,
        rejected: registrants.filter((r) => r.status === "rejected").length,
    };

    const cardStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        textAlign: "center",
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                <p style={{ color: "#6b7280", fontSize: 15 }}>Memuat data pendaftaran...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 32 }}>
                <p style={{ color: "#dc2626" }}>{error}</p>
                <button onClick={fetchData} style={{ marginTop: 12, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                    Coba lagi
                </button>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "Inter, sans-serif", padding: "24px 32px", maxWidth: 1100, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Manajemen Pendaftaran PPDB</h1>
                <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Kelola status penerimaan pendaftar langsung dari sini.</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                    { label: "Total", value: stats.total, color: "#2563eb" },
                    { label: "Pending", value: stats.pending, color: "#ca8a04" },
                    { label: "Review", value: stats.review, color: "#2563eb" },
                    { label: "Diterima", value: stats.approved, color: "#16a34a" },
                    { label: "Ditolak", value: stats.rejected, color: "#dc2626" },
                ].map((s) => (
                    <div key={s.label} style={{ ...cardStyle, borderTop: `3px solid ${s.color}` }}>
                        <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Cari nama atau kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                />
                <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                >
                    {years.map((y) => <option key={y} value={y}>{y === "Semua" ? "Semua Tahun" : `Tahun ${y}`}</option>)}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                >
                    <option value="Semua">Semua Status</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s}</option>)}
                </select>
                <button onClick={fetchData} style={{ padding: "8px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
                    ↻ Refresh
                </button>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                {["Kode", "Tanggal", "Nama Lengkap", "Email", "Tahun PPDB", "Status", "Ubah Status"].map((h) => (
                                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Tidak ada data yang cocok</td>
                                </tr>
                            ) : filtered.map((r) => (
                                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#374151" }}>{r.kode_pendaftaran}</td>
                                    <td style={{ padding: "10px 14px", color: "#6b7280" }}>
                                        {new Date(r.created_at).toLocaleDateString("id-ID")}
                                    </td>
                                    <td style={{ padding: "10px 14px", fontWeight: 500 }}>{r.nama_lengkap}</td>
                                    <td style={{ padding: "10px 14px", color: "#6b7280" }}>{r.email}</td>
                                    <td style={{ padding: "10px 14px", color: "#6b7280" }}>{r.tahun_ppdb}</td>
                                    <td style={{ padding: "10px 14px" }}>
                                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, ...Object.fromEntries(getStatusStyle(r.status).split(";").filter(Boolean).map(s => s.split(":").map(x => x.trim()) as [string, string])) }}>
                                            {r.status ?? "pending"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 14px" }}>
                                        {updating === r.id ? (
                                            <span style={{ color: "#9ca3af", fontSize: 13 }}>Menyimpan...</span>
                                        ) : (
                                            <select
                                                value={r.status ?? "pending"}
                                                onChange={(e) => updateStatus(r.id, e.target.value as Status)}
                                                style={{ padding: "5px 9px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", fontSize: 13, color: "#9ca3af" }}>
                    Menampilkan {filtered.length} dari {registrants.length} pendaftar
                </div>
            </div>
        </div>
    );
}
