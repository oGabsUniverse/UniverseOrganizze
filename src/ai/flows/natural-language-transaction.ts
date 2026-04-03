
'use server';
/**
 * @fileOverview Um agente de IA de alto desempenho para processar comandos de transações.
 *
 * - processNaturalTransaction - Converte texto livre em uma transação estruturada com alta precisão.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalTransactionInputSchema = z.object({
  text: z.string().describe('O comando de voz ou texto do usuário.'),
  availableCategories: z.array(z.string()).describe('Lista de categorias disponíveis no sistema.'),
});
export type NaturalTransactionInput = z.infer<typeof NaturalTransactionInputSchema>;

const NaturalTransactionOutputSchema = z.object({
  description: z.string().describe('Descrição limpa da transação (ex: Marmita).'),
  amount: z.number().describe('Valor numérico absoluto extraído.'),
  type: z.enum(['DEBITO', 'CREDITO']).describe('Tipo: DEBITO para gastos/pagamentos, CREDITO para ganhos/recebimentos.'),
  category: z.string().describe('A categoria mais adequada da lista disponível.'),
  explanation: z.string().describe('Breve explicação do que foi entendido.'),
  success: z.boolean().describe('True se conseguiu extrair valor e descrição mínima.'),
});
export type NaturalTransactionOutput = z.infer<typeof NaturalTransactionOutputSchema>;

export async function processNaturalTransaction(input: NaturalTransactionInput): Promise<NaturalTransactionOutput> {
  return processNaturalTransactionFlow(input);
}

const parseTransactionPrompt = ai.definePrompt({
  name: 'parseTransactionPrompt',
  input: { schema: NaturalTransactionInputSchema },
  output: { schema: NaturalTransactionOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Você é o cérebro do assistente financeiro Universe AI. Sua tarefa é extrair dados financeiros de frases em português do Brasil com precisão cirúrgica.

LISTA DE CATEGORIAS DISPONÍVEIS:
{{#each availableCategories}}
- {{{this}}}
{{/each}}

REGRAS DE OURO:
1. VALOR: Extraia o valor numérico. Entenda "conto", "pila", "reais", "R$", "merrecas". Ex: "50 pila" = 50.00. 
   Se o usuário disser "quarenta e dois e noventa", entenda 42.90.
2. TIPO: 
   - DEBITO: gastei, paguei, comprei, perdi, tive que dar, débito, pix pra, jantei, almocei, ifood, uber.
   - CREDITO: recebi, ganhei, caiu, vendi, rendeu, salário, bônus, pix de, depósito.
3. CATEGORIA: Escolha a MAIS PRÓXIMA da lista acima. 
   - Marmita/Restaurante/Pizza -> "Alimentação"
   - Uber/Gasolina/Posto -> "Transporte"
   - Luz/Água/Internet -> "Custos fixos" ou "Contas"
   - Se não souber, use "Outros".
4. DESCRIÇÃO: Limpe a frase. Deixe apenas o "quê" ou "onde". Remova verbos de ação. Capitalize a primeira letra.
   Ex: "gastei 25 reais em uma marmita no 99food" -> "Marmita no 99food".

EXEMPLOS:
- "30 de uber" -> { "description": "Uber", "amount": 30, "type": "DEBITO", "category": "Transporte", "success": true }
- "recebi 1500 de salario" -> { "description": "Salário", "amount": 1500, "type": "CREDITO", "category": "Salário", "success": true }
- "ifood 42 e 90" -> { "description": "Ifood", "amount": 42.90, "type": "DEBITO", "category": "Alimentação", "success": true }
- "paguei 120 de luz" -> { "description": "Luz", "amount": 120, "type": "DEBITO", "category": "Custos fixos", "success": true }

TEXTO DO USUÁRIO: "{{{text}}}"

Responda apenas o JSON. Se não houver um valor numérico claro, success deve ser false.`,
});

const processNaturalTransactionFlow = ai.defineFlow(
  {
    name: 'processNaturalTransactionFlow',
    inputSchema: NaturalTransactionInputSchema,
    outputSchema: NaturalTransactionOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await parseTransactionPrompt(input);
      if (!output) throw new Error('Falha na resposta da IA');
      
      if (output.amount < 0) output.amount = Math.abs(output.amount);
      
      return output;
    } catch (error) {
      console.error('Erro Universe AI:', error);
      return {
        description: '',
        amount: 0,
        type: 'DEBITO',
        category: 'Outros',
        explanation: 'Não consegui captar o valor. Tente dizer algo como: "Marmita 25 reais"',
        success: false
      };
    }
  }
);
