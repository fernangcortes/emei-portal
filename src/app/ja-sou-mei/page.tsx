"use client";

import { useState } from "react";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { MinhaEmpresa } from "@/components/dashboard/minha-empresa";
import { Financeiro } from "@/components/dashboard/financeiro";
import { Documentos } from "@/components/dashboard/documentos";
import { Painel } from "@/components/dashboard/painel";
import { Obrigacoes } from "@/components/dashboard/obrigacoes";
import { Ferramentas } from "@/components/dashboard/ferramentas";
import { Clientes } from "@/components/dashboard/clientes";
import { Curriculo } from "@/components/dashboard/curriculo";


export default function JaSouMeiPage() {
    const [activeTab, setActiveTab] = useState("painel");

    return (
        <section className="py-8 sm:py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Já sou <span className="text-primary">MEI</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gerencie sua empresa, finanças e obrigações em um só lugar.
                    </p>
                </div>

                {/* Tabs */}
                <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

                {/* Tab content */}
                <div className="min-h-[500px]">
                    {activeTab === "painel" && <Painel />}
                    {activeTab === "empresa" && <MinhaEmpresa />}
                    {activeTab === "clientes" && <Clientes />}
                    {activeTab === "financeiro" && <Financeiro />}
                    {activeTab === "documentos" && <Documentos />}
                    {activeTab === "obrigacoes" && <Obrigacoes />}
                    {activeTab === "curriculo" && <Curriculo />}

                    {activeTab === "ferramentas" && <Ferramentas />}
                </div>
            </div>
        </section>
    );
}
