"use client";

import { useEmpresaStore } from "@/store/empresa-store";
import { useConfigStore } from "@/store/config-store";
import { generateWithGemini } from "@/lib/gemini";
import { useState, useEffect, ReactNode } from "react";

interface CurriculoData {
    titulo: string;
    subtitulo: string;
    sobre: string;
    servicos: { titulo: string; descricao: string; preco: string }[];
    experiencias: { cargo: string; local: string; periodo: string; descricao: string }[];
    formacoes: { curso: string; instituicao: string; ano: string }[];
    habilidades: string[];
    redesSociais: { nome: string; url: string }[];
}

const defaultData: CurriculoData = {
    titulo: "", subtitulo: "", sobre: "",
    servicos: [], experiencias: [], formacoes: [], habilidades: [], redesSociais: [],
};

const Field = ({ label, value, onChange, placeholder, multiline = false, action }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; action?: ReactNode;
}) => (
    <div>
        <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
            {action}
        </div>
        {multiline ? (
            <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        ) : (
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        )}
    </div>
);

const ListInput = ({ value, onChange, placeholder, className }: {
    value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) => (
    <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
    />
);

export function Curriculo() {
    const empresa = useEmpresaStore((s) => s.empresa);
    const geminiApiKey = useConfigStore((s) => s.geminiApiKey);
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<CurriculoData>(defaultData);
    const [preview, setPreview] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("emei-curriculo");
            if (saved) setData(JSON.parse(saved));
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) localStorage.setItem("emei-curriculo", JSON.stringify(data));
    }, [data, mounted]);

    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const addServico = () => setData({ ...data, servicos: [...data.servicos, { titulo: "", descricao: "", preco: "" }] });
    const addExp = () => setData({ ...data, experiencias: [...data.experiencias, { cargo: "", local: "", periodo: "", descricao: "" }] });
    const addFormacao = () => setData({ ...data, formacoes: [...data.formacoes, { curso: "", instituicao: "", ano: "" }] });
    const addRede = () => setData({ ...data, redesSociais: [...data.redesSociais, { nome: "", url: "" }] });

    const updateServico = (i: number, field: string, value: string) => {
        const arr = [...data.servicos]; (arr[i] as Record<string, string>)[field] = value; setData({ ...data, servicos: arr });
    };
    const updateExp = (i: number, field: string, value: string) => {
        const arr = [...data.experiencias]; (arr[i] as Record<string, string>)[field] = value; setData({ ...data, experiencias: arr });
    };
    const updateFormacao = (i: number, field: string, value: string) => {
        const arr = [...data.formacoes]; (arr[i] as Record<string, string>)[field] = value; setData({ ...data, formacoes: arr });
    };
    const updateRede = (i: number, field: string, value: string) => {
        const arr = [...data.redesSociais]; (arr[i] as Record<string, string>)[field] = value; setData({ ...data, redesSociais: arr });
    };

    const addSkill = () => {
        if (newSkill.trim() && !data.habilidades.includes(newSkill.trim())) {
            setData({ ...data, habilidades: [...data.habilidades, newSkill.trim()] });
            setNewSkill("");
        }
    };

    const handleGenerateBio = async () => {
        if (!geminiApiKey) return alert("Configure a Chave de API do Gemini na aba Minha Empresa.");
        setIsGeneratingBio(true);
        try {
            const prompt = `Atue como um redator profissional. Escreva um "Sobre mim" (bio) persuasivo e profissional para incluir em um currículo/portfólio.
Dados do profissional:
- Função/Título: ${data.titulo || empresa.razaoSocial} - ${data.subtitulo || "Empreendedor"}
- Serviços oferecidos: ${data.servicos.map(s => s.titulo).join(", ")}
- Habilidades: ${data.habilidades.join(", ")}
- Experiências relevantes: ${data.experiencias.map(e => e.cargo).join(", ")}
Requisitos:
- O texto deve ser escrito em primeira pessoa do singular ("Eu...")
- Deve ter cerca de 3 a 5 parágrafos médios.
- Foque em destacar as habilidades e o valor que os serviços trazem.
- Sem inventar dados não fornecidos, use os dados como base.
Não inicie com saudações genéricas (ex: "Olá"), vá direto ao ponto e não coloque o texto entre aspas de formatação.`;
            const bio = await generateWithGemini(prompt, geminiApiKey);
            setData({ ...data, sobre: bio });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const generateHTML = () => {
        const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.titulo || empresa.razaoSocial || "Currículo MEI"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.6}
.page{max-width:800px;margin:0 auto;background:#fff;min-height:100vh}
.header{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:48px 40px;position:relative;overflow:hidden}
.header::after{content:'';position:absolute;top:-50%;right:-20%;width:300px;height:300px;background:rgba(255,255,255,.08);border-radius:50%}
.header h1{font-size:28px;font-weight:800;letter-spacing:-.5px}
.header .subtitle{font-size:15px;opacity:.9;margin-top:4px}
.header .contact{margin-top:16px;font-size:13px;opacity:.85;display:flex;flex-wrap:wrap;gap:12px}
.section{padding:32px 40px}
.section:nth-child(even){background:#f8fafc}
.section h2{font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#059669;border-bottom:2px solid #d1fae5;padding-bottom:8px;margin-bottom:16px}
.about{font-size:14px;color:#475569;line-height:1.8}
.services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.service-card{border:1px solid #e2e8f0;border-radius:12px;padding:20px;transition:box-shadow .2s}
.service-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.05)}
.service-card h3{font-size:14px;font-weight:700;color:#1e293b}
.service-card p{font-size:12px;color:#64748b;margin-top:4px}
.service-card .price{font-size:16px;font-weight:800;color:#059669;margin-top:12px}
.timeline-item{display:flex;gap:16px;padding:12px 0;border-bottom:1px solid #f1f5f9}
.timeline-item:last-child{border:none}
.timeline-dot{width:12px;height:12px;border-radius:50%;background:#10b981;margin-top:4px;flex-shrink:0}
.timeline-item h3{font-size:14px;font-weight:700}
.timeline-item .meta{font-size:12px;color:#64748b}
.timeline-item .desc{font-size:13px;color:#475569;margin-top:4px}
.skills{display:flex;flex-wrap:wrap;gap:8px}
.skill{background:#d1fae5;color:#065f46;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600}
.social{display:flex;flex-wrap:wrap;gap:8px}
.social a{display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;color:#334155;text-decoration:none;transition:background .2s}
.social a:hover{background:#e2e8f0}
.footer{text-align:center;padding:24px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0}
@media print{body{background:#fff}.page{box-shadow:none}}
</style></head><body>
<div class="page">
<div class="header">
<h1>${data.titulo || empresa.razaoSocial || "Seu Nome"}</h1>
<div class="subtitle">${data.subtitulo || "Microempreendedor Individual"}</div>
<div class="contact">
${empresa.email ? `<span>📧 ${empresa.email}</span>` : ""}
${empresa.telefone ? `<span>📱 ${empresa.telefone}</span>` : ""}
${empresa.cnpj ? `<span>🏢 CNPJ: ${empresa.cnpj}</span>` : ""}
${empresa.endereco.cidade ? `<span>📍 ${empresa.endereco.cidade} - ${empresa.endereco.estado}</span>` : ""}
</div>
</div>
${data.sobre ? `<div class="section"><h2>Sobre</h2><p class="about">${data.sobre.replace(/\n/g, "<br>")}</p></div>` : ""}
${data.servicos.length > 0 ? `<div class="section"><h2>Serviços</h2><div class="services-grid">${data.servicos.map((s) => `<div class="service-card"><h3>${s.titulo}</h3><p>${s.descricao}</p>${s.preco ? `<div class="price">${s.preco}</div>` : ""}</div>`).join("")}</div></div>` : ""}
${data.experiencias.length > 0 ? `<div class="section"><h2>Experiência</h2>${data.experiencias.map((e) => `<div class="timeline-item"><div class="timeline-dot"></div><div><h3>${e.cargo}</h3><div class="meta">${e.local}${e.periodo ? ` · ${e.periodo}` : ""}</div>${e.descricao ? `<p class="desc">${e.descricao}</p>` : ""}</div></div>`).join("")}</div>` : ""}
${data.formacoes.length > 0 ? `<div class="section"><h2>Formação</h2>${data.formacoes.map((f) => `<div class="timeline-item"><div class="timeline-dot"></div><div><h3>${f.curso}</h3><div class="meta">${f.instituicao}${f.ano ? ` · ${f.ano}` : ""}</div></div></div>`).join("")}</div>` : ""}
${data.habilidades.length > 0 ? `<div class="section"><h2>Habilidades</h2><div class="skills">${data.habilidades.map((h) => `<span class="skill">${h}</span>`).join("")}</div></div>` : ""}
${data.redesSociais.length > 0 ? `<div class="section"><h2>Redes Sociais</h2><div class="social">${data.redesSociais.map((r) => `<a href="${r.url}" target="_blank">🔗 ${r.nome}</a>`).join("")}</div></div>` : ""}
<div class="footer">Gerado pelo eMEI Portal · ${new Date().toLocaleDateString("pt-BR")}</div>
</div></body></html>`;
        return html;
    };

    const exportHTML = () => {
        const html = generateHTML();
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "curriculo_mei.html"; a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const html = generateHTML();
        const w = window.open("", "_blank");
        if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    };

    if (preview) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Pré-visualização</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setPreview(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">← Voltar</button>
                        <button onClick={exportHTML} className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-accent">📄 HTML</button>
                        <button onClick={exportPDF} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">📥 PDF</button>
                    </div>
                </div>
                <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
                    <iframe srcDoc={generateHTML()} className="w-full h-[600px] border-0" title="Preview" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Currículo / Portfólio</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Crie seu currículo profissional MEI exportável em HTML e PDF.</p>
                </div>
                <button onClick={() => setPreview(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110">
                    👁️ Visualizar
                </button>
            </div>

            {/* Info Geral */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold">👤 Informações Gerais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Título / Nome" value={data.titulo} onChange={(v) => setData({ ...data, titulo: v })} placeholder={empresa.razaoSocial || "Seu nome ou marca"} />
                    <Field label="Subtítulo / Profissão" value={data.subtitulo} onChange={(v) => setData({ ...data, subtitulo: v })} placeholder="Ex: Designer Gráfico | MEI" />
                </div>
                <Field
                    label="Sobre você"
                    value={data.sobre}
                    onChange={(v) => setData({ ...data, sobre: v })}
                    placeholder="Conte sobre sua experiência, diferenciais e o que oferece..."
                    multiline
                    action={
                        <button
                            onClick={handleGenerateBio}
                            disabled={isGeneratingBio || (!data.servicos.length && !data.habilidades.length)}
                            className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full hover:bg-emerald-200 disabled:opacity-50 transition-all flex items-center gap-1"
                        >
                            {isGeneratingBio ? "⏳ Gerando..." : "✨ Escrever com IA"}
                        </button>
                    }
                />
            </div>

            {/* Serviços */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">💼 Serviços Oferecidos</h3>
                    <button onClick={addServico} className="text-xs font-bold text-primary hover:underline">+ Adicionar</button>
                </div>
                {data.servicos.map((s, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-dashed border-border relative">
                        <ListInput value={s.titulo} onChange={(v) => updateServico(i, "titulo", v)} placeholder="Nome do serviço" />
                        <ListInput value={s.descricao} onChange={(v) => updateServico(i, "descricao", v)} placeholder="Descrição breve" />
                        <div className="flex gap-2">
                            <ListInput value={s.preco} onChange={(v) => updateServico(i, "preco", v)} placeholder="R$ ou faixa" className="flex-1" />
                            <button onClick={() => setData({ ...data, servicos: data.servicos.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500 p-2">✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Experiências */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">📋 Experiência Profissional</h3>
                    <button onClick={addExp} className="text-xs font-bold text-primary hover:underline">+ Adicionar</button>
                </div>
                {data.experiencias.map((e, i) => (
                    <div key={i} className="p-3 rounded-xl border border-dashed border-border space-y-2 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ListInput value={e.cargo} onChange={(v) => updateExp(i, "cargo", v)} placeholder="Cargo/Função" />
                            <ListInput value={e.local} onChange={(v) => updateExp(i, "local", v)} placeholder="Empresa/Local" />
                            <div className="flex gap-2">
                                <ListInput value={e.periodo} onChange={(v) => updateExp(i, "periodo", v)} placeholder="2020 - 2023" className="flex-1" />
                                <button onClick={() => setData({ ...data, experiencias: data.experiencias.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500 p-2">✕</button>
                            </div>
                        </div>
                        <ListInput value={e.descricao} onChange={(v) => updateExp(i, "descricao", v)} placeholder="Breve descrição das atividades" className="w-full" />
                    </div>
                ))}
            </div>

            {/* Formação */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">🎓 Formação</h3>
                    <button onClick={addFormacao} className="text-xs font-bold text-primary hover:underline">+ Adicionar</button>
                </div>
                {data.formacoes.map((f, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl border border-dashed border-border">
                        <ListInput value={f.curso} onChange={(v) => updateFormacao(i, "curso", v)} placeholder="Curso" />
                        <ListInput value={f.instituicao} onChange={(v) => updateFormacao(i, "instituicao", v)} placeholder="Instituição" />
                        <div className="flex gap-2">
                            <ListInput value={f.ano} onChange={(v) => updateFormacao(i, "ano", v)} placeholder="Ano" className="flex-1" />
                            <button onClick={() => setData({ ...data, formacoes: data.formacoes.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500 p-2">✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Habilidades */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-bold">⚡ Habilidades</h3>
                <div className="flex gap-2">
                    <ListInput value={newSkill} onChange={setNewSkill} placeholder="Nova habilidade" className="flex-1" />
                    <button onClick={addSkill} className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.habilidades.map((h) => (
                        <span key={h} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            {h}
                            <button onClick={() => setData({ ...data, habilidades: data.habilidades.filter((x) => x !== h) })} className="hover:text-red-500 ml-1">✕</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Redes Sociais */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">🔗 Redes Sociais / Links</h3>
                    <button onClick={addRede} className="text-xs font-bold text-primary hover:underline">+ Adicionar</button>
                </div>
                {data.redesSociais.map((r, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                        <ListInput value={r.nome} onChange={(v) => updateRede(i, "nome", v)} placeholder="Nome (ex: Instagram)" />
                        <div className="flex gap-2">
                            <ListInput value={r.url} onChange={(v) => updateRede(i, "url", v)} placeholder="URL" className="flex-1" />
                            <button onClick={() => setData({ ...data, redesSociais: data.redesSociais.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-500 p-2">✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Export */}
            <div className="flex gap-3">
                <button onClick={exportHTML} className="flex-1 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-4 text-center hover:shadow-md transition-all">
                    <span className="text-2xl block mb-1">📄</span>
                    <span className="text-sm font-bold">Baixar HTML</span>
                </button>
                <button onClick={exportPDF} className="flex-1 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center hover:shadow-md transition-all">
                    <span className="text-2xl block mb-1">📥</span>
                    <span className="text-sm font-bold">Exportar PDF</span>
                </button>
            </div>
        </div>
    );
}
