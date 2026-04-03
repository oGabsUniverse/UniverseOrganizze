'use server';
/**
 * @fileOverview A Genkit flow for automatically categorizing financial transactions using AI.
 *
 * - smartTransactionCategorization - A function that handles the AI-powered transaction categorization process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTransactionCategorizationInputSchema = z.object({
  description: z.string().describe('A descrição da transação (ex: "COMPRA SUPERMERCADO").'),
  amount: z.number().describe('O valor da transação (ex: 150.75).'),
  date: z.string().describe('A data da transação no formato YYYY-MM-DD (ex: "2023-10-26").'),
  bankAccountName: z.string().optional().describe('O nome da conta bancária de origem da transação (ex: "Minha Conta Corrente").'),
  transactionType: z.enum(['DEBITO', 'CREDITO']).describe('O tipo da transação, se é débito ou crédito.').default('DEBITO'),
  currentCategories: z.array(z.string()).optional().describe('Uma lista de categorias financeiras existentes para referência da IA.'),
});
export type SmartTransactionCategorizationInput = z.infer<typeof SmartTransactionCategorizationInputSchema>;

const SmartTransactionCategorizationOutputSchema = z.object({
  originalDescription: z.string().describe('A descrição original da transação.'),
  originalAmount: z.number().describe('O valor original da transação.'),
  originalDate: z.string().describe('A data original da transação.'),
  category: z.string().describe('A categoria sugerida pela IA para a transação.'),
  explanation: z.string().describe('Uma breve explicação do porquê a IA sugeriu essa categoria.'),
});
export type SmartTransactionCategorizationOutput = z.infer<typeof SmartTransactionCategorizationOutputSchema>;

export async function smartTransactionCategorization(input: SmartTransactionCategorizationInput): Promise<SmartTransactionCategorizationOutput> {
  return smartTransactionCategorizationFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: { schema: SmartTransactionCategorizationInputSchema },
  output: { schema: SmartTransactionCategorizationOutputSchema },
  prompt: `Analise a transação abaixo e sugira a melhor categoria.

Categorias de referência:
{{#if currentCategories}}
{{#each currentCategories}}
- {{{this}}}
{{/each}}
{{else}}
Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Salário, Investimentos, Outros.
{{/if}}

Dados da Transação:
- Descrição: {{{description}}}
- Valor: R$ {{{amount}}}
- Tipo: {{{transactionType}}}
{{#if bankAccountName}}- Conta: {{{bankAccountName}}}{{/if}}

Seja preciso e escolha a categoria que mais faz sentido com o nome do estabelecimento ou descrição.`,
});

const smartTransactionCategorizationFlow = ai.defineFlow(
  {
    name: 'smartTransactionCategorizationFlow',
    inputSchema: SmartTransactionCategorizationInputSchema,
    outputSchema: SmartTransactionCategorizationOutputSchema,
  },
  async (input) => {
    const {output} = await categorizeTransactionPrompt(input);
    if (!output) {
      throw new Error('IA falhou em categorizar.');
    }
    return output;
  }
);
