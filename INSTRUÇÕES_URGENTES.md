# 🔧 INSTRUÇÕES URGENTES - CONCERTAR VINCULAÇÃO DE EMPRESAS

## ⚠️ PROBLEMA ATUAL
A função "Add Empresa" no evento **NÃO está vinculando** empresas aos eventos.

## ✅ SOLUÇÃO (3 PASSOS)

### **PASSO 1: EXECUTAR SQL NO SUPABASE** 🔴 **URGENTE**

1. Abra o Supabase: https://supabase.com/dashboard/project/cmokolimmxplhmkkbuhm/sql
2. **Cole TUDO do arquivo `supabase_schema_COMPLETO.sql`** (está na raiz do projeto)
3. Clique em **RUN** (botão verde no canto inferior direito)
4. **AGUARDE** até aparecer "Success" ✅

**POR QUE?** 
- Garante que a tabela `event_companies` existe
- Cria políticas de segurança (RLS) corretas
- Corrige o ENUM de status

---

### **PASSO 2: TESTAR NO NAVEGADOR**

Depois de rodar o SQL:

1. Abra o site (Vercel ou localhost)
2. **Abra o Console do navegador** (aperte F12)
3. Vá em **Eventos** → Clique em um evento → **"Add Empresa"**
4. Selecione uma empresa ou crie nova
5. Clique em **"Vincular Agora"**
6. **OLHE NO CONSOLE** (F12):
   - Se aparecer `✅ Empresa vinculada com sucesso:` → **FUNCIONOU!**
   - Se aparecer `❌ ERRO ao vincular empresa:` → **ME MANDE O PRINT DO ERRO**

---

### **PASSO 3: VERIFICAR SE SALVOU**

Se não aparecer erro no console MAS a empresa não aparecer na tabela:

1. Volte ao Supabase SQL Editor
2. Execute este comando:

```sql
SELECT * FROM event_companies ORDER BY created_at DESC LIMIT 10;
```

3. **Me mande print do resultado**

---

## 🐛 POSSÍVEIS ERROS E SOLUÇÕES

### ❌ Erro: "permission denied for table event_companies"
**SOLUÇÃO:** Rode o SQL do `supabase_schema_COMPLETO.sql` novamente

### ❌ Erro: "null value in column company_id violates not-null constraint"
**SOLUÇÃO:** Significa que a empresa não está sendo criada antes. Vou corrigir o código.

### ❌ Erro: "ENUM value 'CONTATO_FEITO' does not exist"
**SOLUÇÃO:** O ENUM não foi criado. Rode o SQL completo.

---

## 📝 ALTERAÇÕES QUE FIZ AGORA

1. ✅ Criei arquivo `supabase_schema_COMPLETO.sql` com TODA a estrutura
2. ✅ Adicionei logs detalhados em `addRelation()`:
   - `📤 Tentando vincular empresa ao evento:`
   - `✅ Empresa vinculada com sucesso:`
   - `❌ ERRO ao vincular empresa:`
3. ✅ Adicionei tratamento de erro que mostra mensagem clara
4. ✅ Deploy enviado para Vercel

---

## 🚀 PRÓXIMOS PASSOS

**VOCÊ AGORA:**
1. Rode o SQL no Supabase
2. Teste no navegador com Console aberto (F12)
3. Me mande print de QUALQUER erro que aparecer

**EU VOU:**
- Corrigir QUALQUER erro que aparecer
- Garantir que a vinculação funcione 100%

---

**ÚLTIMA ATUALIZAÇÃO:** 29/01/2026 - 11:31 AM
