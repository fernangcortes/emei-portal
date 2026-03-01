const fs = require('fs');

const data = JSON.parse(fs.readFileSync('ocupacoes-permitidas-MEI.json', 'utf8'));
const cnaes = [];
let currentOcc = '';
let currentCode = '';
let currentDesc = '';

// The columns map roughly to:
// x < 20: Occupation Title
// 20 <= x < 26: CNAE Code
// 26 <= x < 42: Description
// x > 42: S/N ISS and ICMS

for (const page of data.formImage.Pages) {
    // Sort texts primarily by Y, then by X
    const texts = page.Texts.map(t => ({
        x: t.x,
        y: t.y,
        text: decodeURIComponent(t.R[0].T).trim().replace(/\r/g, '')
    })).sort((a, b) => {
        if (Math.abs(a.y - b.y) < 0.5) { // same line threshold
            return a.x - b.x;
        }
        return a.y - b.y;
    });

    let currentY = -1;
    let rowParts = { title: '', code: '', desc: '', flags: '' };

    for (const t of texts) {
        if (!t.text || t.text === 'OCUPAÇÃO' || t.text === 'CNAE' || t.text === 'DESCRIÇÃO' || t.text === 'ISS' || t.text === 'ICMS' || t.text.includes('MEI - Microempreendedor Individual')) {
            continue;
        }

        let col = '';
        if (t.x < 20) col = 'title';
        else if (t.x >= 20 && t.x < 26.5) col = 'code';
        else if (t.x >= 26.5 && t.x < 42) col = 'desc';
        else col = 'flags';

        if (col === 'flags' && (t.text === 'S' || t.text === 'N')) {
            // End of an item if we see an S or N flag
            if (!rowParts.flags) {
                rowParts.flags = t.text;
            } else {
                rowParts.flags += ' ' + t.text;
            }

            if (rowParts.flags.length >= 3) {
                // S N
                if (currentCode) {
                    cnaes.push({
                        code: currentCode,
                        occupation: currentOcc.trim(),
                        description: currentDesc.trim() || currentOcc.trim()
                    });
                }
                currentOcc = '';
                currentCode = '';
                currentDesc = '';
                rowParts = { title: '', code: '', desc: '', flags: '' };
            }
        } else {
            if (col === 'title') {
                currentOcc += (currentOcc ? ' ' : '') + t.text;
            } else if (col === 'code' && t.text.match(/\d{4}-\d\/\d{2}/)) {
                currentCode = t.text;
            } else if (col === 'desc') {
                currentDesc += (currentDesc ? ' ' : '') + t.text;
            }
        }
    }
}

// Push the very last item if stuck in buffer
if (currentCode) {
    cnaes.push({
        code: currentCode,
        occupation: currentOcc.trim(),
        description: currentDesc.trim() || currentOcc.trim()
    });
}

const categories = ['Alimentação', 'Beleza e Estética', 'Comércio', 'Construção Civil', 'Educação e Informática', 'Indústria e Artesanato', 'Moda e Vestuário', 'Saúde e Bem-Estar', 'Serviços Gerais', 'Transporte', 'Outros'];

const categorize = (desc) => {
    const d = desc.toLowerCase();
    if (d.match(/alimento|alimentação|refeições|comida|doce|bolo|salgado|bebida|suco|lanchonete|restaurante|bar|mercearia|açougue|padaria|hortifruti|peixaria|sorvete|bombom|chocolate|café|chá/)) return 'Alimentação';
    if (d.match(/beleza|estética|cabeleireiro|manicure|pedicure|maquiagem|cosmético|perfume|depilação|esteticista|barbeiro|maquiador/)) return 'Beleza e Estética';
    if (d.match(/construção|edificação|obra|pedreiro|pintor|eletricista|encanador|gesso|cimento|alvenaria|ferragem|telha|vidro|reforma|azulejista|carpinteiro|concreto/)) return 'Construção Civil';
    if (d.match(/educação|ensino|curso|treinamento|palestra|informática|computador|software|tecnologia|internet|escola|professor|instrutor/)) return 'Educação e Informática';
    if (d.match(/indústria|fabricação|manufatura|produção|artesanato|artesão|joia|marcenaria|serralheria|confecção|costura|ourives|cerâmica|couro|madeira|papel|plástico|fabricante/)) return 'Indústria e Artesanato';
    if (d.match(/moda|vestuário|roupa|sapato|calçado|bolsa|acessório|tecido|costureira|alfaiate|brechó|bordadeiro/)) return 'Moda e Vestuário';
    if (d.match(/saúde|bem-estar|clínica|médico|dentista|enfermeiro|farmácia|academia|esporte|drogaria|terapia|psicólogo|cuidador/)) return 'Saúde e Bem-Estar';
    if (d.match(/transporte|motorista|táxi|aplicativo|frete|mudança|van|ônibus|caminhão|entrega|motoboy|passageiro|transportador/)) return 'Transporte';
    if (d.match(/comércio|varejista|atacadista|loja|vendas|representante|revenda|distribuidor|comerciante/)) return 'Comércio';
    if (d.match(/serviço|mecânica|manutenção|limpeza|lavanderia|conserto|reparação|instalação|agência|locação|aluguel|fotografia|filmador|filmagem|audiovisual|vídeo|design|eventos|dj|editor/)) return 'Serviços Gerais';
    return 'Outros';
};

cnaes.forEach(c => c.category = categorize(c.occupation + ' ' + c.description));

const normalizeCase = (str) => {
    // Basic title case for words, keep small words lowercase
    const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'sem', 'a', 'o', 'as', 'os'];
    return str.split(' ').map((word, i) => {
        const w = word.toLowerCase();
        if (i !== 0 && smallWords.includes(w)) return w;
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
};

let tsContent = 'export interface Cnae {\n    code: string;\n    description: string;\n    category: string;\n}\n\nexport const CATEGORIES = [\n    "Alimentação",\n    "Beleza e Estética",\n    "Comércio",\n    "Construção Civil",\n    "Educação e Informática",\n    "Indústria e Artesanato",\n    "Moda e Vestuário",\n    "Saúde e Bem-Estar",\n    "Serviços Gerais",\n    "Transporte",\n    "Outros",\n] as const;\n\nexport type Category = (typeof CATEGORIES)[number];\n\nexport const CNAES_MEI: Cnae[] = [\n';

const uniqueCodes = new Set();
let printedFilmador = false;

cnaes.forEach(c => {
    if (uniqueCodes.has(c.code)) return;
    uniqueCodes.add(c.code);

    if (c.occupation.includes('FILMADOR')) printedFilmador = true;

    // Use Occupation name as desc, and prepend the actual description if wanted, but occupation is usually the public name.
    const finalDesc = normalizeCase(c.occupation + " - " + c.description.replace(/^- /, '')).replace(/"/g, '\\"');
    tsContent += '    { code: "' + c.code + '", description: "' + finalDesc + '", category: "' + c.category + '" },\n';
});

tsContent += '];\n';

fs.writeFileSync('src/data/cnaes-mei.ts', tsContent, { encoding: 'utf8' });
console.log('Successfully wrote ' + uniqueCodes.size + ' official CNAEs to src/data/cnaes-mei.ts');
console.log('FILMADOR found?:', printedFilmador);
