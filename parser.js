const fs = require('fs');
const txt = fs.readFileSync('ocupacoes-permitidas-MEI.content.txt', 'utf8')
    .replace(/----Page \(\d+\) Break----/g, '');

const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const cnaes = [];

let currentOcc = [];
let currentCode = '';
let currentDesc = '';

let state = 'OCCUPATION'; // OCCUPATION | CODE_DESC

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === 'OCUPAÇÃO' || line === 'CNAE DESCRIÇÃO ISS ICMS' || line === '----') {
        continue;
    }

    if (line.match(/^[SN]\s+[SN]$/) || line.match(/^[SN]\s+[SN]\s+[SN]/)) {
        // End of item
        let occName = currentOcc.join(' ');

        if (currentCode) {
            cnaes.push({
                code: currentCode,
                occupation: occName,
                description: currentDesc.trim() || occName
            });
        }

        currentOcc = [];
        currentCode = '';
        currentDesc = '';
        state = 'OCCUPATION';
        continue;
    }

    const codeMatch = line.match(/(\d{4}-\d\/\d{2})/);

    if (state === 'OCCUPATION') {
        if (codeMatch) {
            currentCode = codeMatch[1];

            // Text before the code might belong to occupation if on same line, or it might just be the code.
            const idx = codeMatch.index;
            if (idx > 0) {
                currentOcc.push(line.substring(0, idx).trim());
            }

            currentDesc = line.substring(idx + 9).trim();
            state = 'CODE_DESC';
        } else {
            currentOcc.push(line);
        }
    } else if (state === 'CODE_DESC') {
        currentDesc += ' ' + line;
    }
}

const categories = ['Alimentação', 'Beleza e Estética', 'Comércio', 'Construção Civil', 'Educação e Informática', 'Indústria e Artesanato', 'Moda e Vestuário', 'Saúde e Bem-Estar', 'Serviços Gerais', 'Transporte', 'Outros'];

const categorize = (desc) => {
    const d = desc.toLowerCase();
    if (d.match(/alimento|alimentação|refeições|comida|doce|bolo|salgado|bebida|suco|lanchonete|restaurante|bar|mercearia|açougue|padaria|hortifruti|peixaria|sorvete|bombom|chocolate|café|chá/)) return 'Alimentação';
    if (d.match(/beleza|estética|cabeleireiro|manicure|pedicure|maquiagem|cosmético|perfume|depilação|esteticista|barbeiro|maquiador/)) return 'Beleza e Estética';
    if (d.match(/construção|edificação|obra|pedreiro|pintor|eletricista|encanador|gesso|cimento|alvenaria|ferragem|telha|vidro|reforma|azulejista|carpinteiro|concreto/)) return 'Construção Civil';
    if (d.match(/educação|ensino|curso|treinamento|palestra|informática|computador|software|tecnologia|internet|escola|professor|instrutor/)) return 'Educação e Informática';
    if (d.match(/indústria|fabricação|manufatura|produção|artesanato|artesão|joia|marcenaria|serralheria|confecção|costura|ourives|cerâmica|couro|madeira|papel|plástico/)) return 'Indústria e Artesanato';
    if (d.match(/moda|vestuário|roupa|sapato|calçado|bolsa|acessório|tecido|costureira|alfaiate|brechó|bordadeiro/)) return 'Moda e Vestuário';
    if (d.match(/saúde|bem-estar|clínica|médico|dentista|enfermeiro|farmácia|academia|esporte|drogaria|terapia|psicólogo|cuidador/)) return 'Saúde e Bem-Estar';
    if (d.match(/transporte|motorista|táxi|aplicativo|frete|mudança|van|ônibus|caminhão|entrega|motoboy|passageiro/)) return 'Transporte';
    if (d.match(/comércio|varejista|atacadista|loja|vendas|representante|revenda|distribuidor|comerciante/)) return 'Comércio';
    if (d.match(/serviço|mecânica|manutenção|limpeza|lavanderia|conserto|reparação|instalação|agência|locação|aluguel|fotografia|filmador|filmagem|audiovisual|design|eventos|dj|editor/)) return 'Serviços Gerais';
    return 'Outros';
};

cnaes.forEach(c => c.category = categorize(c.occupation + ' ' + c.description));

const normalizeCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

let tsContent = 'export interface Cnae {\n    code: string;\n    description: string;\n    category: string;\n}\n\nexport const CATEGORIES = [\n    "Alimentação",\n    "Beleza e Estética",\n    "Comércio",\n    "Construção Civil",\n    "Educação e Informática",\n    "Indústria e Artesanato",\n    "Moda e Vestuário",\n    "Saúde e Bem-Estar",\n    "Serviços Gerais",\n    "Transporte",\n    "Outros",\n] as const;\n\nexport type Category = (typeof CATEGORIES)[number];\n\nexport const CNAES_MEI: Cnae[] = [\n';

const uniqueCodes = new Set();

cnaes.forEach(c => {
    if (uniqueCodes.has(c.code)) return;
    uniqueCodes.add(c.code);

    // We use Occupation name as the primary description, just capitalized normally.
    const finalDesc = normalizeCase(c.occupation).replace(/"/g, '\\"');
    tsContent += '    { code: "' + c.code + '", description: "' + finalDesc + '", category: "' + c.category + '" },\n';
});

tsContent += '];\n';

fs.writeFileSync('src/data/cnaes-mei.ts', tsContent, { encoding: 'utf8' });
console.log('Successfully wrote ' + uniqueCodes.size + ' official CNAEs to src/data/cnaes-mei.ts');
console.log('FILMADOR Check:', cnaes.filter(c => c.occupation.includes('FILMADOR')));
