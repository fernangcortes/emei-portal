"use client";

import { useEmpresaStore } from "@/store/empresa-store";
import { useConfigStore } from "@/store/config-store";
import { useClientesStore, type Cliente } from "@/store/clientes-store";
import { generateFromDocument, generateWithGemini } from "@/lib/gemini";
import { useState, useEffect, useRef } from "react";

interface OrcamentoItem {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
}

interface OrcamentoData {
    id: string;
    tipo: "nf" | "recibo" | "orcamento";
    numero: string;
    clienteId: string;
    clienteNome: string;
    clienteDoc: string;
    clienteEmail: string;
    clienteEndereco: string;
    titulo: string;
    itens: OrcamentoItem[];
    observacoes: string;
    validade: string;
    formaPagamento: string;
    data: string;
}

const genId = () => Math.random().toString(36).slice(2, 10);
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Documentos() {
    const empresa = useEmpresaStore((s) => s.empresa);
    const geminiApiKey = useConfigStore((s) => s.geminiApiKey);
    const clientes = useClientesStore((s) => s.clientes);
    const [mounted, setMounted] = useState(false);
    const [isGeneratingObs, setIsGeneratingObs] = useState(false);
    const [docs, setDocs] = useState<OrcamentoData[]>([]);
    const [activeForm, setActiveForm] = useState<"nf" | "recibo" | "orcamento" | null>(null);
    const [previewDoc, setPreviewDoc] = useState<OrcamentoData | null>(null);
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    
    const [form, setForm] = useState<Omit<OrcamentoData, "id">>({
        tipo: "orcamento", numero: "", clienteId: "", clienteNome: "", clienteDoc: "", clienteEmail: "", clienteEndereco: "",
        titulo: "", itens: [{ descricao: "", quantidade: 1, valorUnitario: 0 }], observacoes: "", validade: "30 dias", formaPagamento: "PIX", data: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("emei-documentos-v2");
            if (saved) setDocs(JSON.parse(saved));
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) localStorage.setItem("emei-documentos-v2", JSON.stringify(docs));
    }, [docs, mounted]);

    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const selectCliente = (id: string) => {
        setSelectedClienteId(id);
        const c = clientes.find((cl) => cl.id === id);
        if (c) {
            setForm({ ...form, clienteId: c.id, clienteNome: c.nome, clienteDoc: c.cpfCnpj, clienteEmail: c.email, clienteEndereco: c.endereco });
        }
    };

    const addItem = () => setForm({ ...form, itens: [...form.itens, { descricao: "", quantidade: 1, valorUnitario: 0 }] });
    const removeItem = (i: number) => setForm({ ...form, itens: form.itens.filter((_, j) => j !== i) });
    const updateItem = (i: number, field: keyof OrcamentoItem, value: string | number) => {
        const arr = [...form.itens];
        arr[i] = { ...arr[i], [field]: value };
        setForm({ ...form, itens: arr });
    };
    const total = form.itens.reduce((s, item) => s + item.quantidade * item.valorUnitario, 0);

    const handleGenerateObs = async () => {
        if (!geminiApiKey) return alert("Configure a Chave de API do Gemini na aba Minha Empresa.");
        setIsGeneratingObs(true);
        try {
            const prompt = `Atue como um redator corporativo. Escreva "Observações e Termos" profissionais e persuasivos para incluir em uma proposta comercial/orçamento (MEI).
Dados:
- Prestador: ${empresa.razaoSocial || "A empresa"}
- Cliente: ${form.clienteNome || "O cliente"}
- Serviços: ${form.itens.map(i => i.descricao).filter(Boolean).join(", ") || "Serviços prestados"}
- Forma de Pagamento: ${form.formaPagamento}
- Validade: ${form.validade}
Requisitos:
- Escreva de 1 a 2 parágrafos cordiais, formais e que passem segurança na execução do serviço.
- Não use saudações. Apenas o texto (ex: "Garantimos a excelência na entrega... O pagamento será realizado via...").
- Não use asteriscos, negrito ou markdown. Apenas texto puro.`;
            const obs = await generateWithGemini(prompt, geminiApiKey);
            setForm({ ...form, observacoes: obs });
        } catch (e: any) { alert(e.message); } finally { setIsGeneratingObs(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!geminiApiKey) {
            alert("Configure a Chave de API do Gemini na aba Minha Empresa.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64String = (reader.result as string).split(",")[1];
                const mimeType = file.type;

                const prompt = `Analise este documento (pode ser nota fiscal, print, foto, ou texto com dados de cliente).
Extraia os dados do cliente e os itens/serviços detalhados.
Retorne APENAS um objeto JSON rigorosamente neste formato:
{
  "clienteNome": "",
  "clienteDoc": "",
  "clienteEmail": "",
  "clienteEndereco": "",
  "itens": [
    {
      "descricao": "",
      "quantidade": 1,
      "valorUnitario": 0.00
    }
  ],
  "observacoes": "",
  "formaPagamento": "",
  "titulo": ""
}
Se não encontrar um campo, deixe em branco. Para itens, tente extrair a lista com suas devidas quantidades e valores monetários numéricos exatos.`;

                try {
                    const jsonStr = await generateFromDocument(prompt, base64String, mimeType, geminiApiKey);
                    const parsed = JSON.parse(jsonStr);

                    setForm({
                        ...form,
                        clienteNome: parsed.clienteNome || form.clienteNome,
                        clienteDoc: parsed.clienteDoc || form.clienteDoc,
                        clienteEmail: parsed.clienteEmail || form.clienteEmail,
                        clienteEndereco: parsed.clienteEndereco || form.clienteEndereco,
                        titulo: parsed.titulo || form.titulo,
                        observacoes: parsed.observacoes || form.observacoes,
                        formaPagamento: parsed.formaPagamento || form.formaPagamento,
                        itens: parsed.itens && parsed.itens.length > 0 ? parsed.itens : form.itens
                    });

                    alert("Dados importados com sucesso!");
                } catch (error: any) {
                    alert("Erro ao extrair dados do documento: " + error.message);
                } finally {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            };
            reader.onerror = () => {
                alert("Erro ao ler arquivo.");
                setIsImporting(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setIsImporting(false);
        }
    };

    const handleCreate = () => {
        if (form.itens.length === 0 || total <= 0) return;
        const newDoc: OrcamentoData = { ...form, id: genId(), tipo: activeForm! };
        setDocs([newDoc, ...docs]);
        setForm({ tipo: "orcamento", numero: "", clienteId: "", clienteNome: "", clienteDoc: "", clienteEmail: "", clienteEndereco: "", titulo: "", itens: [{ descricao: "", quantidade: 1, valorUnitario: 0 }], observacoes: "", validade: "30 dias", formaPagamento: "PIX", data: new Date().toISOString().slice(0, 10) });
        setActiveForm(null);
    };

    const tipoLabels = { nf: "Nota Fiscal", recibo: "Recibo", orcamento: "Orçamento" };
    const tipoEmoji = { nf: "🧾", recibo: "📃", orcamento: "💼" };

    const generateHTML = (doc: OrcamentoData) => {
        const docTotal = doc.itens.reduce((s, item) => s + item.quantidade * item.valorUnitario, 0);
        const tipoTitle = tipoLabels[doc.tipo].toUpperCase();
        const primaryColor = doc.tipo === "orcamento" ? "#10b981" : doc.tipo === "nf" ? "#3b82f6" : "#8b5cf6";
        const lightColor = doc.tipo === "orcamento" ? "#d1fae5" : doc.tipo === "nf" ? "#dbeafe" : "#ede9fe";

        return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${tipoTitle} ${doc.numero ? "#" + doc.numero : ""} - ${empresa.razaoSocial || "MEI"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f1f5f9;color:#1e293b;line-height:1.6;padding:20px}
.page{max-width:800px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,${primaryColor} 0%,${primaryColor}dd 100%);color:#fff;padding:40px;position:relative}
.header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:4px;background:rgba(255,255,255,.3)}
.header-grid{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
.header h1{font-size:24px;font-weight:800;letter-spacing:-.5px}
.header .doc-type{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:.8;margin-bottom:4px}
.header .doc-num{font-size:32px;font-weight:800;text-align:right}
.header .doc-date{font-size:13px;opacity:.85;text-align:right;margin-top:4px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:32px 40px;background:${lightColor}}
.party h3{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${primaryColor};margin-bottom:8px}
.party p{font-size:13px;color:#475569}
.party .name{font-size:15px;font-weight:700;color:#1e293b}
.items{padding:32px 40px}
.items h3{font-size:14px;font-weight:700;margin-bottom:16px;color:${primaryColor}}
.items table{width:100%;border-collapse:collapse}
.items th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding:8px 12px;border-bottom:2px solid #e2e8f0}
.items td{padding:12px;font-size:13px;border-bottom:1px solid #f1f5f9}
.items td:last-child,.items th:last-child{text-align:right}
.items td.desc{font-weight:600;color:#1e293b}
.items tr:hover{background:#fafafa}
.total-section{padding:0 40px 32px;display:flex;justify-content:flex-end}
.total-box{background:${lightColor};border-radius:12px;padding:20px 24px;min-width:240px}
.total-row{display:flex;justify-content:space-between;gap:32px;font-size:13px;padding:4px 0}
.total-row.grand{font-size:18px;font-weight:800;color:${primaryColor};border-top:2px solid ${primaryColor};padding-top:12px;margin-top:8px}
.notes{padding:0 40px 32px}
.notes-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px}
.notes-box h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:6px}
.notes-box p{font-size:12px;color:#64748b;white-space:pre-wrap}
.footer{border-top:1px solid #e2e8f0;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8}
.badge{display:inline-block;background:${primaryColor};color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px}
@media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}@page{margin:10mm}}
</style></head><body>
<div class="page">
<div class="header">
<div class="header-grid">
<div>
<div class="doc-type">${tipoTitle}</div>
<h1>${empresa.razaoSocial || "Sua Empresa MEI"}</h1>
</div>
<div>
<div class="doc-num">${doc.numero ? "#" + doc.numero : "#" + doc.id.slice(0, 4).toUpperCase()}</div>
<div class="doc-date">${new Date(doc.data + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
</div>
</div>
</div>
<div class="parties">
<div class="party">
<h3>Prestador</h3>
<p class="name">${empresa.razaoSocial || "—"}</p>
<p>CNPJ: ${empresa.cnpj || "—"}</p>
${empresa.endereco.rua ? `<p>${empresa.endereco.rua}, ${empresa.endereco.numero}${empresa.endereco.complemento ? " - " + empresa.endereco.complemento : ""}</p>` : ""}
${empresa.endereco.cidade ? `<p>${empresa.endereco.bairro ? empresa.endereco.bairro + " — " : ""}${empresa.endereco.cidade}/${empresa.endereco.estado} ${empresa.endereco.cep ? "- CEP " + empresa.endereco.cep : ""}</p>` : ""}
${empresa.telefone ? `<p>Tel: ${empresa.telefone}</p>` : ""}
${empresa.email ? `<p>${empresa.email}</p>` : ""}
</div>
<div class="party">
<h3>Cliente</h3>
<p class="name">${doc.clienteNome || "—"}</p>
${doc.clienteDoc ? `<p>CPF/CNPJ: ${doc.clienteDoc}</p>` : ""}
${doc.clienteEndereco ? `<p>${doc.clienteEndereco}</p>` : ""}
${doc.clienteEmail ? `<p>${doc.clienteEmail}</p>` : ""}
</div>
</div>
${doc.titulo ? `<div style="padding:0 40px 16px"><h2 style="font-size:16px;font-weight:700">${doc.titulo}</h2></div>` : ""}
<div class="items">
<h3>Itens</h3>
<table>
<thead><tr><th>Descrição</th><th>Qtd</th><th>Valor Un.</th><th>Subtotal</th></tr></thead>
<tbody>
${doc.itens.map((item) => `<tr><td class="desc">${item.descricao || "—"}</td><td>${item.quantidade}</td><td>${fmt(item.valorUnitario)}</td><td><strong>${fmt(item.quantidade * item.valorUnitario)}</strong></td></tr>`).join("")}
</tbody>
</table>
</div>
<div class="total-section">
<div class="total-box">
<div class="total-row"><span>Subtotal</span><span>${fmt(docTotal)}</span></div>
<div class="total-row"><span>Impostos (DAS)</span><span>Incluso</span></div>
<div class="total-row grand"><span>TOTAL</span><span>${fmt(docTotal)}</span></div>
</div>
</div>
${doc.observacoes || doc.validade || doc.formaPagamento ? `
<div class="notes"><div class="notes-box">
${doc.formaPagamento ? `<h4>Forma de Pagamento</h4><p>${doc.formaPagamento}</p>` : ""}
${doc.validade ? `<h4 style="margin-top:12px">Validade</h4><p>${doc.validade}</p>` : ""}
${doc.observacoes ? `<h4 style="margin-top:12px">Observações</h4><p>${doc.observacoes}</p>` : ""}
</div></div>` : ""}
<div class="footer">
<span>Gerado pelo eMEI Portal · ${new Date().toLocaleDateString("pt-BR")}</span>
<span class="badge">${doc.tipo === "orcamento" ? "Proposta Comercial" : doc.tipo === "nf" ? "Documento Fiscal" : "Comprovante"}</span>
</div>
</div></body></html>`;
    };

    const exportHTML = (doc: OrcamentoData) => {
        const html = generateHTML(doc);
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${doc.tipo}_${doc.numero || doc.id}.html`; a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = (doc: OrcamentoData) => {
        const html = generateHTML(doc);
        const w = window.open("", "_blank");
        if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    };

    return (
        <div className="space-y-6">
            {/* Preview mode */}
            {previewDoc && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Pré-visualização</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setPreviewDoc(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">← Voltar</button>
                            <button onClick={() => exportHTML(previewDoc)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-accent">📄 HTML</button>
                            <button onClick={() => exportPDF(previewDoc)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">📥 PDF</button>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
                        <iframe srcDoc={generateHTML(previewDoc)} className="w-full h-[700px] border-0" title="Preview" />
                    </div>
                </div>
            )}

            {/* Main view */}
            {!previewDoc && (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Documentos</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Orçamentos, notas fiscais e recibos profissionais.</p>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-3 gap-3">
                        {(["orcamento", "nf", "recibo"] as const).map((tipo) => (
                            <button key={tipo} onClick={() => { setActiveForm(tipo); setForm({ ...form, tipo }); }}
                                className={`rounded-2xl border p-5 text-center transition-all hover:scale-105 hover:shadow-md ${activeForm === tipo ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                                <span className="text-3xl block mb-2">{tipoEmoji[tipo]}</span>
                                <span className="text-sm font-bold block">{tipoLabels[tipo]}</span>
                                <span className="text-[10px] text-muted-foreground">Criar novo</span>
                            </button>
                        ))}
                    </div>

                    {activeForm === "nf" && (
                        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                            💡 <strong>Nota:</strong> Para NFS-e oficial, use o{" "}
                            <a href="https://www.nfse.gov.br/EmissorNacional" target="_blank" rel="noopener noreferrer" className="underline font-bold">Emissor Nacional</a>.
                        </div>
                    )}

                    {/* Form */}
                    {activeForm && (
                        <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold">Novo {tipoLabels[activeForm]}</h3>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*,text/plain" onChange={handleFileUpload} />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isImporting}
                                        className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 disabled:opacity-50 transition-all flex items-center gap-1"
                                        title="Use IA para preencher dados via NF, foto ou texto"
                                    >
                                        {isImporting ? "⏳ Lendo..." : "✨ Preencher com Imagem/PDF"}
                                    </button>
                                </div>
                                <button onClick={() => setActiveForm(null)} className="text-muted-foreground hover:text-foreground text-xs font-bold">✕ Fechar</button>
                            </div>

                            {/* Meta */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Nº do documento" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título (opcional)" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>

                            {/* Client select */}
                            <div className="rounded-xl border border-border p-4 space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">👤 Cliente</h4>
                                {clientes.length > 0 && (
                                    <select value={selectedClienteId} onChange={(e) => selectCliente(e.target.value)} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        <option value="">Selecionar cliente cadastrado...</option>
                                        {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome} {c.cpfCnpj ? `(${c.cpfCnpj})` : ""}</option>)}
                                    </select>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input value={form.clienteNome} onChange={(e) => setForm({ ...form, clienteNome: e.target.value })} placeholder="Nome do cliente *" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    <input value={form.clienteDoc} onChange={(e) => setForm({ ...form, clienteDoc: e.target.value })} placeholder="CPF/CNPJ" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    <input value={form.clienteEmail} onChange={(e) => setForm({ ...form, clienteEmail: e.target.value })} placeholder="E-mail" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    <input value={form.clienteEndereco} onChange={(e) => setForm({ ...form, clienteEndereco: e.target.value })} placeholder="Endereço" className="rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="rounded-xl border border-border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">📦 Itens / Serviços</h4>
                                    <button onClick={addItem} className="text-xs font-bold text-primary hover:underline">+ Adicionar Item</button>
                                </div>
                                {form.itens.map((item, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                        <input value={item.descricao} onChange={(e) => updateItem(i, "descricao", e.target.value)} placeholder="Descrição" className="col-span-5 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        <input type="number" value={item.quantidade || ""} onChange={(e) => updateItem(i, "quantidade", Number(e.target.value))} placeholder="Qtd" min={1} className="col-span-2 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        <input type="number" value={item.valorUnitario || ""} onChange={(e) => updateItem(i, "valorUnitario", Number(e.target.value))} placeholder="Valor" min={0} step={0.01} className="col-span-2 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        <div className="col-span-2 text-right text-sm font-bold text-primary">{fmt(item.quantidade * item.valorUnitario)}</div>
                                        <button onClick={() => removeItem(i)} className="col-span-1 text-muted-foreground hover:text-red-500 transition-colors text-center">✕</button>
                                    </div>
                                ))}
                                <div className="flex justify-end pt-2 border-t border-border">
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold uppercase text-muted-foreground">Total</div>
                                        <div className="text-xl font-bold text-primary">{fmt(total)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Extras */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Forma de Pagamento</label>
                                    <select value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {["PIX", "Boleto Bancário", "Transferência Bancária", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "50% entrada + 50% na entrega", "Parcelado", "A combinar"].map((f) => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Validade da Proposta</label>
                                    <select value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {["7 dias", "15 dias", "30 dias", "60 dias", "90 dias"].map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Observações e Termos</label>
                                    <button
                                        onClick={handleGenerateObs}
                                        disabled={isGeneratingObs || !form.itens.some(i => i.descricao.length > 3)}
                                        className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full hover:bg-emerald-200 disabled:opacity-50 transition-all flex items-center gap-1"
                                    >
                                        {isGeneratingObs ? "⏳ Gerando..." : "✨ Escrever com IA"}
                                    </button>
                                </div>
                                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações, condições especiais, prazos de entrega..." rows={4} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setActiveForm(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancelar</button>
                                <button onClick={handleCreate} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20">Criar {tipoLabels[activeForm]}</button>
                            </div>
                        </div>
                    )}

                    {/* Docs list */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-bold">Documentos Criados ({docs.length})</h3>
                        </div>
                        {docs.length === 0 ? (
                            <div className="p-10 text-center text-sm text-muted-foreground">Nenhum documento criado ainda.</div>
                        ) : (
                            <div className="divide-y divide-border max-h-96 overflow-y-auto">
                                {docs.map((doc) => {
                                    const docTotal = doc.itens.reduce((s, item) => s + item.quantidade * item.valorUnitario, 0);
                                    return (
                                        <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group">
                                            <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                                                <span className="text-xl shrink-0">{tipoEmoji[doc.tipo]}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {tipoLabels[doc.tipo]} {doc.numero && `#${doc.numero}`}
                                                        {doc.titulo && ` — ${doc.titulo}`}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {doc.clienteNome || "Sem cliente"} · {new Date(doc.data + "T12:00").toLocaleDateString("pt-BR")} · {fmt(docTotal)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={() => setPreviewDoc(doc)} className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all" title="Visualizar">
                                                    👁️
                                                </button>
                                                <button onClick={() => exportHTML(doc)} className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all" title="HTML">
                                                    📄
                                                </button>
                                                <button onClick={() => exportPDF(doc)} className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all" title="PDF">
                                                    📥
                                                </button>
                                                <button onClick={() => setDocs(docs.filter((d) => d.id !== doc.id))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1.5" title="Excluir">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
