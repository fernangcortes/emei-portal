const fs = require('fs');
const lines = fs.readFileSync('ocupacoes-permitidas-MEI.content.txt', 'utf8')
    .replace(/----Page \(\d+\) Break----/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

const cnaes = [];
let currentOcc = [];
let currentCode = '';
let currentDesc = '';
let collectingDesc = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === 'OCUPAÇÃO' || line === 'CNAE DESCRIÇÃO ISS ICMS' || line.startsWith('CNAE DESCRIÇÃO') || line === '----') {
        continue;
    }

    // Check if line contains S and N flags exactly indicating end of entry
    const isFlagsLine = /^[SN]\s+[SN]$/.test(line) || /^[SN]\s+[SN]\s+[SN]$/.test(line);

    if (isFlagsLine) {
        if (currentCode) {
            cnaes.push({
                code: currentCode,
                occupation: currentOcc.join(' ').trim(),
                description: currentDesc.trim() || currentOcc.join(' ').trim()
            });
        }
        currentOcc = [];
        currentCode = '';
        currentDesc = '';
        collectingDesc = false;
        continue;
    }

    // Look for CNAE Code (e.g., "1234-5/67")
    const codeMatch = line.match(/(\d{4}-\d\/\d{2})/);

    if (codeMatch && !collectingDesc) {
        currentCode = codeMatch[1];

        const beforeCode = line.substring(0, codeMatch.index).trim();
        const afterCode = line.substring(codeMatch.index + 9).trim();

        if (beforeCode) {
            currentOcc.push(beforeCode);
        }

        if (afterCode) {
            // S N might be attached at the end of this same line
            const flagsMatch = afterCode.match(/([SN]\s+[SN])$/);
            if (flagsMatch) {
                currentDesc = afterCode.substring(0, flagsMatch.index).trim();
                cnaes.push({
                    code: currentCode,
                    occupation: currentOcc.join(' ').trim(),
                    description: currentDesc || currentOcc.join(' ').trim()
                });
                currentOcc = [];
                currentCode = '';
                currentDesc = '';
                collectingDesc = false;
            } else {
                currentDesc = afterCode;
                collectingDesc = true;
            }
        } else {
            collectingDesc = true;
        }
    } else {
        if (collectingDesc) {
            // S N might be attached at the end of this line too
            const flagsMatch = line.match(/([SN]\s+[SN])$/);
            if (flagsMatch) {
                currentDesc += ' ' + line.substring(0, flagsMatch.index).trim();
                cnaes.push({
                    code: currentCode,
                    occupation: currentOcc.join(' ').trim(),
                    description: currentDesc.trim() || currentOcc.join(' ').trim()
                });
                currentOcc = [];
                currentCode = '';
                currentDesc = '';
                collectingDesc = false;
            } else {
                currentDesc += ' ' + line;
            }
        } else {
            currentOcc.push(line);
        }
    }
}

const categorize = (desc) => {
    const d = desc.toLowerCase();
    if (d.match(/alimento|alimentação|refeições|comida|doce|bolo|salgado|bebida|suco|lanchonete|restaurante|bar|mercearia|açougue|padaria|hortifruti|peixaria|sorvete|bombom|chocolate|café|chá/)) return 'Alimentação';
    if (d.match(/beleza|estética|cabeleireiro|manicure|pedicure|maquiagem|cosmético|perfume|depilação|esteticista|barbeiro|maquiador/)) return 'Beleza e Estética';
    if (d.match(/construção|edificação|obra|pedreiro|pintor|eletricista|encanador|gesso|cimento|alvenaria|ferragem|telha|vidro|reforma|azulejista|carpinteiro|concreto/)) return 'Construção Civil';
    if (d.match(/educação|ensino|curso|treinamento|palestra|informática|computador|software|tecnologia|internet|escola|professor|instrutor/)) return 'Educação e Informática';
    if (d.match(/arte|cultura|música|teatro|ator|dança|artista|pintura|artesanato|artesão|escultura|apresentador/)) return 'Arte e Cultura';
    if (d.match(/fotografia|fotógrafo|filmador|filmagem|audiovisual|vídeo|cinema|cinegrafista|edição de vídeo/)) return 'Fotografia e Audiovisual';
    if (d.match(/indústria|fabricação|manufatura|produção|joia|marcenaria|serralheria|confecção|costura|ourives|cerâmica|couro|madeira|papel|plástico|fabricante/)) return 'Indústria e Artesanato';
    if (d.match(/moda|vestuário|roupa|sapato|calçado|bolsa|acessório|tecido|costureira|alfaiate|brechó|bordadeiro/)) return 'Moda e Vestuário';
    if (d.match(/saúde|bem-estar|clínica|médico|dentista|enfermeiro|farmácia|academia|esporte|drogaria|terapia|psicólogo|cuidador/)) return 'Saúde e Bem-Estar';
    if (d.match(/transporte|motorista|táxi|aplicativo|frete|mudança|van|ônibus|caminhão|entrega|motoboy|passageiro|transportador/)) return 'Transporte';
    if (d.match(/comércio|varejista|atacadista|loja|vendas|representante|revenda|distribuidor|comerciante/)) return 'Comércio';
    if (d.match(/serviço|mecânica|manutenção|limpeza|lavanderia|conserto|reparação|instalação|agência|locação|aluguel|design|eventos|dj|editor/)) return 'Serviços Gerais';
    return 'Outros';
};

cnaes.forEach(c => c.category = categorize(c.occupation + ' ' + c.description));

const normalizeCase = (str) => {
    const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'sem', 'a', 'o', 'as', 'os'];
    return str.replace(/\s+/g, ' ').split(' ').map((word, i) => {
        const w = word.toLowerCase();
        if (i !== 0 && smallWords.includes(w)) return w;
        if (w.includes('(') || w.includes(')')) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
};

let tsContent = 'export interface Cnae {\n    code: string;\n    description: string;\n    category: string;\n}\n\nexport const CATEGORIES = [\n    "Alimentação",\n    "Arte e Cultura",\n    "Beleza e Estética",\n    "Comércio",\n    "Construção Civil",\n    "Educação e Informática",\n    "Fotografia e Audiovisual",\n    "Indústria e Artesanato",\n    "Moda e Vestuário",\n    "Saúde e Bem-Estar",\n    "Serviços Gerais",\n    "Transporte",\n    "Outros",\n] as const;\n\nexport type Category = (typeof CATEGORIES)[number];\n\nexport const CNAES_MEI: Cnae[] = [\n';

const uniqueCodes = new Set();
let foundFilmador = false;

cnaes.forEach(c => {
    if (uniqueCodes.has(c.code)) return;
    uniqueCodes.add(c.code);

    if (c.occupation.includes('FILMADOR')) foundFilmador = true;

    // We will use the proper naming as extracted from the PDF, stripping dashed lines
    let occ = normalizeCase(c.occupation.replace(/-+/g, '').trim());
    if (occ.length > 250) return; // Skip preamble text from page 1

    if (c.description && c.description !== c.occupation && c.description.length > 5 && !c.description.includes(c.occupation)) {
        occ += ' - ' + normalizeCase(c.description);
    }

    const finalDesc = occ.replace(/"/g, '\\"');
    tsContent += '    { code: "' + c.code + '", description: "' + finalDesc + '", category: "' + c.category + '" },\n';
});

tsContent += '];\n';

fs.writeFileSync('src/data/cnaes-mei.ts', tsContent, { encoding: 'utf8' });
console.log('Successfully wrote ' + uniqueCodes.size + ' official CNAEs to src/data/cnaes-mei.ts');
console.log('FILMADOR extracted successfully?', foundFilmador);
