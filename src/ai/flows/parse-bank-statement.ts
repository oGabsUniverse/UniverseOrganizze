'use server';
/**
 * @fileOverview Agente de IA para extração de transações de extratos bancários complexos (especializado em Nubank).
 * 
 * - parseBankStatement: Processa PDFs, Imagens ou Texto e retorna uma lista de transações estruturadas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseStatementInputSchema = z.object({
  fileDataUri: z.string().describe("O arquivo (PDF, Imagem ou Texto) em formato Data URI base64."),
  mimeType: z.string().describe("O tipo MIME do arquivo enviado."),
  availableCategories: z.array(z.string()).describe("Lista de categorias permitidas."),
});
export type ParseStatementInput = z.infer<typeof ParseStatementInputSchema>;

const StatementTransactionSchema = z.object({
  date: z.string().describe("Data no formato YYYY-MM-DD."),
  description: z.string().describe("Descrição limpa da transação."),
  amount: z.number().describe("Valor absoluto positivo com precisão decimal."),
  type: z.enum(['DEBITO', 'CREDITO']).describe("Tipo da transação."),
  category: z.string().describe("Categoria sugerida da lista fornecida."),
  explanation: z.string().describe("Breve motivo da escolha."),
});

const ParseStatementOutputSchema = z.object({
  transactions: z.array(StatementTransactionSchema),
  summary: z.string().describe("Resumo do que foi encontrado."),
});
export type ParseStatementOutput = z.infer<typeof ParseStatementOutputSchema>;

export async function parseBankStatement(input: ParseStatementInput): Promise<ParseStatementOutput> {
  return parseBankStatementFlow(input);
}

const parseStatementPrompt = ai.definePrompt({
  name: 'parseStatementPrompt',
  input: { schema: ParseStatementInputSchema },
  output: { schema: ParseStatementOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Você é o Especialista em Extração Bancária do Universe Organizze. Sua missão é ler o documento fornecido e extrair TODAS as transações financeiras reais, sem ignorar nenhum dia, especialmente o dia 31.

DOCUMENTO: {{media url=fileDataUri}}

CATEGORIAS DISPONÍVEIS:
{{#each availableCategories}}
- {{{this}}}
{{/each}}

LÓGICA DE EXTRAÇÃO INFALÍVEL (FOCO NUBANK):
1. IDENTIFIQUE DATAS: Procure por linhas contendo datas no formato "D MMM YYYY" ou "DD MMM YYYY" (ex: 1 JAN 2026, 15 JAN 2026, 31 JAN 2026).
2. IDENTIFIQUE SINAIS (+ ou -): Procure por valores numéricos que contenham um sinal de MAIS (+) ou MENOS (-).
   - Valores com "+" -> Tipo: CREDITO.
   - Valores com "-" -> Tipo: DEBITO.
3. VÍNCULO DE DESCRIÇÃO: O nome da transação está geralmente nas 1 a 3 linhas IMEDIATAMENTE ACIMA do valor com sinal.
4. IGNORE ABSOLUTAMENTE:
   - Linhas de "Total de entradas" ou "Total de saídas" (são resumos).
   - Linhas de "Saldo do dia" ou informativos de rodapé.
   - CNPJs e códigos longos de transação (ex: E123...).
   - "Resgate RDB" quando for apenas o resumo do dia.

VALIDAÇÕES CRÍTICAS:
- Extraia TODAS as transações do início ao fim do documento. Não pare no dia 30 se houver dia 31.
- Converta datas para YYYY-MM-DD.
- O valor deve ser um número positivo absoluto (remova o sinal para o campo numérico).
- Limpe a descrição para deixar apenas o nome essencial do estabelecimento ou pessoa.

Responda apenas o JSON estruturado seguindo o schema de saída.`,
});

const parseBankStatementFlow = ai.defineFlow(
  {
    name: 'parseBankStatementFlow',
    inputSchema: ParseStatementInputSchema,
    outputSchema: ParseStatementOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await parseStatementPrompt(input);
      if (!output || !output.transactions) throw new Error('A IA não conseguiu identificar transações válidas neste documento.');
      
      // Sanitização extra de segurança: ignora valores irreais (provavelmente códigos de barras lidos como valor)
      const sanitizedTransactions = output.transactions.filter(t => {
        return t.amount > 0 && t.amount < 100000000; 
      });

      return {
        ...output,
        transactions: sanitizedTransactions
      };
    } catch (error) {
      console.error('Erro no processamento do extrato:', error);
      throw error;
    }
  }
);
