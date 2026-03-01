"use client";

import { useClientesStore, type Cliente } from "@/store/clientes-store";
import { useState, useEffect } from "react";

export function Clientes() {
    const { clientes, addCliente, updateCliente, removeCliente } = useClientesStore();
    const [mounted, setMounted] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ nome: "", cpfCnpj: "", email: "", telefone: "", endereco: "", notas: "" });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const filtered = clientes.filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.cpfCnpj.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = () => {
        if (!form.nome) return;
        if (editingId) {
            updateCliente(editingId, form);
            setEditingId(null);
        } else {
            addCliente(form);
        }
        setForm({ nome: "", cpfCnpj: "", email: "", telefone: "", endereco: "", notas: "" });
        setShowForm(false);
    };

    const startEdit = (c: Cliente) => {
        setForm({ nome: c.nome, cpfCnpj: c.cpfCnpj, email: c.email, telefone: c.telefone, endereco: c.endereco, notas: c.notas });
        setEditingId(c.id);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">Área de Clientes</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus clientes e fornecedores.</p>
                </div>
                <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nome: "", cpfCnpj: "", email: "", telefone: "", endereco: "", notas: "" }); }}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                    + Novo Cliente
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{clientes.length}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Total</div>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{clientes.filter((c) => c.cpfCnpj.length > 14).length}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Empresas (CNPJ)</div>
                </div>
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3 text-center">
                    <div className="text-2xl font-bold text-violet-700">{clientes.filter((c) => c.cpfCnpj.length <= 14).length}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Pessoas (CPF)</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {/* Form */}
            {showForm && (
                <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4">
                    <h3 className="text-sm font-bold">{editingId ? "Editar Cliente" : "Novo Cliente"}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo / Razão Social *" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} placeholder="CPF ou CNPJ" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail" type="email" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone / WhatsApp" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço" className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Observações" rows={2} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancelar</button>
                        <button onClick={handleSubmit} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">{editingId ? "Atualizar" : "Salvar"}</button>
                    </div>
                </div>
            )}

            {/* List */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    {clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum resultado encontrado."}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                                        {c.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{c.nome}</p>
                                        <p className="text-[11px] text-muted-foreground">{c.cpfCnpj || "Sem documento"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(c)} className="rounded-lg border border-border p-1.5 hover:bg-accent" title="Editar">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                    </button>
                                    <button onClick={() => removeCliente(c.id)} className="rounded-lg border border-border p-1.5 hover:bg-red-50 hover:text-red-500" title="Excluir">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                {c.email && <span className="flex items-center gap-1">📧 {c.email}</span>}
                                {c.telefone && <span className="flex items-center gap-1">📱 {c.telefone}</span>}
                            </div>
                            {c.notas && <p className="mt-2 text-xs text-muted-foreground italic border-t border-border pt-2 line-clamp-2">{c.notas}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
