"use client";

import { useEmpresaStore } from "@/store/empresa-store";
import { useConfigStore } from "@/store/config-store";
import { useState, useEffect, useRef } from "react";
import { generateFromDocument } from "@/lib/gemini";

const estados = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS",
    "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC",
    "SE", "SP", "TO",
];

const Field = ({ label, value, onChange, placeholder, type = "text", half = false }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; half?: boolean;
}) => (
    <div className={half ? "flex-1 min-w-[140px]" : "w-full"}>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
    </div>
);

export function MinhaEmpresa() {
    const { empresa, updateEmpresa, updateEndereco } = useEmpresaStore();
    const { geminiApiKey, setGeminiApiKey } = useConfigStore();
    const [mounted, setMounted] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-muted" />
                ))}
            </div>
        );
    }

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!geminiApiKey) {
            alert("Configure a Chave de API do Gemini no final desta página primeiro.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64String = (reader.result as string).split(",")[1];
                const mimeType = file.type;

                const prompt = `Extraia os dados principais deste documento (como um Certificado de Condição de MEI - CCMEI). 
Retorne ESTRITAMENTE um objeto JSON válido (sem blocos markdown) no seguinte formato (deixe em branco se não achar):
{
  "cnpj": "",
  "razaoSocial": "",
  "dataAbertura": "YYYY-MM-DD",
  "capitalSocial": "",
  "cnaePrincipal": "código - descrição",
  "cnaesSecundarios": ["código - descrição", "código - descrição"],
  "endereco": { "cep": "", "rua": "", "numero": "", "bairro": "", "cidade": "", "estado": "" }
}`;

                try {
                    const jsonStr = await generateFromDocument(prompt, base64String, mimeType, geminiApiKey);
                    const parsed = JSON.parse(jsonStr);
                    
                    if (parsed.cnpj) updateEmpresa({ cnpj: parsed.cnpj });
                    if (parsed.razaoSocial) updateEmpresa({ razaoSocial: parsed.razaoSocial });
                    if (parsed.dataAbertura) updateEmpresa({ dataAbertura: parsed.dataAbertura });
                    if (parsed.capitalSocial) updateEmpresa({ capitalSocial: parsed.capitalSocial });
                    if (parsed.cnaePrincipal) updateEmpresa({ cnaePrincipal: parsed.cnaePrincipal });
                    if (parsed.cnaesSecundarios && Array.isArray(parsed.cnaesSecundarios)) {
                        updateEmpresa({ cnaesSecundarios: parsed.cnaesSecundarios });
                    }

                    if (parsed.endereco) {
                        updateEndereco({
                            cep: parsed.endereco.cep || "",
                            rua: parsed.endereco.rua || "",
                            numero: parsed.endereco.numero || "",
                            bairro: parsed.endereco.bairro || "",
                            cidade: parsed.endereco.cidade || "",
                            estado: parsed.endereco.estado || ""
                        });
                    }

                    alert("Dados importados com sucesso!");
                } catch (error: any) {
                    alert("Erro ao extrair dados: " + error.message);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Minha Empresa</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Seus dados cadastrais como MEI. Salvos automaticamente no navegador.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="rounded-xl bg-blue-100 text-blue-800 border border-blue-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all hover:bg-blue-200 disabled:opacity-50 flex items-center gap-1.5"
                        title="Importar dados do CCMEI via IA"
                    >
                        {isImporting ? "⏳ Lendo..." : "✨ Importar CCMEI (PDF)"}
                    </button>
                    <button
                        onClick={handleSave}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${saved
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                            }`}
                    >
                        {saved ? "✓ Salvo!" : "💾 Salvar"}
                    </button>
                </div>
            </div>

            {/* Dados Gerais */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs">📄</span>
                    Dados Gerais
                </h3>
                <div className="flex flex-wrap gap-4">
                    <Field
                        label="CNPJ"
                        value={empresa.cnpj}
                        onChange={(v) => updateEmpresa({ cnpj: v })}
                        placeholder="00.000.000/0001-00"
                        half
                    />
                    <Field
                        label="Razão Social"
                        value={empresa.razaoSocial}
                        onChange={(v) => updateEmpresa({ razaoSocial: v })}
                        placeholder="Nome completo da empresa"
                        half
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Field
                        label="Data de Abertura"
                        value={empresa.dataAbertura}
                        onChange={(v) => updateEmpresa({ dataAbertura: v })}
                        type="date"
                        half
                    />
                    <Field
                        label="Capital Social"
                        value={empresa.capitalSocial}
                        onChange={(v) => updateEmpresa({ capitalSocial: v })}
                        placeholder="R$ 1.000,00"
                        half
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Tipo de Atividade
                    </label>
                    <div className="flex gap-2">
                        {([
                            { value: "comercio", label: "Comércio", sub: "R$ 75,90/mês" },
                            { value: "servico", label: "Serviço", sub: "R$ 79,90/mês" },
                            { value: "ambos", label: "Ambos", sub: "R$ 80,90/mês" },
                        ] as const).map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => updateEmpresa({ tipoAtividade: opt.value })}
                                className={`flex-1 rounded-xl border p-3 text-center transition-all ${empresa.tipoAtividade === opt.value
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                                    }`}
                            >
                                <div className="text-sm font-bold">{opt.label}</div>
                                <div className="text-[11px] mt-0.5 opacity-70">{opt.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-xs">📍</span>
                    Endereço
                </h3>
                <div className="flex flex-wrap gap-4">
                    <Field
                        label="CEP"
                        value={empresa.endereco.cep}
                        onChange={(v) => updateEndereco({ cep: v })}
                        placeholder="00000-000"
                        half
                    />
                    <Field
                        label="Rua"
                        value={empresa.endereco.rua}
                        onChange={(v) => updateEndereco({ rua: v })}
                        placeholder="Nome da rua"
                        half
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Field
                        label="Número"
                        value={empresa.endereco.numero}
                        onChange={(v) => updateEndereco({ numero: v })}
                        placeholder="123"
                        half
                    />
                    <Field
                        label="Complemento"
                        value={empresa.endereco.complemento}
                        onChange={(v) => updateEndereco({ complemento: v })}
                        placeholder="Apt, sala, etc."
                        half
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Field
                        label="Bairro"
                        value={empresa.endereco.bairro}
                        onChange={(v) => updateEndereco({ bairro: v })}
                        placeholder="Bairro"
                        half
                    />
                    <Field
                        label="Cidade"
                        value={empresa.endereco.cidade}
                        onChange={(v) => updateEndereco({ cidade: v })}
                        placeholder="Cidade"
                        half
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Estado
                    </label>
                    <select
                        value={empresa.endereco.estado}
                        onChange={(e) => updateEndereco({ estado: e.target.value })}
                        className="w-full sm:w-48 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    >
                        <option value="">Selecionar...</option>
                        {estados.map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contato */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-xs">📞</span>
                    Contato
                </h3>
                <div className="flex flex-wrap gap-4">
                    <Field
                        label="Telefone / WhatsApp"
                        value={empresa.telefone}
                        onChange={(v) => updateEmpresa({ telefone: v })}
                        placeholder="(11) 99999-9999"
                        half
                    />
                    <Field
                        label="E-mail"
                        value={empresa.email}
                        onChange={(v) => updateEmpresa({ email: v })}
                        placeholder="contato@empresa.com"
                        type="email"
                        half
                    />
                </div>
            </div>

            {/* CNAEs */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-xs">📋</span>
                    CNAEs cadastrados
                </h3>
                <Field
                    label="CNAE Principal"
                    value={empresa.cnaePrincipal}
                    onChange={(v) => updateEmpresa({ cnaePrincipal: v })}
                    placeholder="Ex: 7311-4/00 - Agências de publicidade"
                />
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        CNAEs Secundários
                    </label>
                    <textarea
                        value={empresa.cnaesSecundarios.join("\n")}
                        onChange={(e) => updateEmpresa({ cnaesSecundarios: e.target.value.split("\n") })}
                        placeholder="Um CNAE por linha"
                        rows={3}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
                    />
                </div>
            </div>
            {/* Configurações de IA */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs">✨</span>
                    Configurações de Inteligência Artificial
                </h3>
                <div className="space-y-2 relative">
                    <Field
                        label="Chave de API do Gemini (Google AI)"
                        value={geminiApiKey}
                        onChange={setGeminiApiKey}
                        placeholder="AIzaSy..."
                        type="password"
                    />
                    <p className="text-xs text-muted-foreground">
                        Sua chave é salva apenas no seu navegador e usada para gerar textos profissionais (orçamentos, currículo). <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Obter chave gratuitamente</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
