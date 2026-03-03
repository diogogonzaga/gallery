# Diagnóstico - Imagens Não Carregam

## 🔍 Passo 1: Abrir DevTools

> 📌 **Nota**: se a configuração do Supabase estiver incorreta ou nonexistent, a aplicação carrega automaticamente
> algumas imagens de exemplo para que a interface continue a funcionar. Isto é útil para desenvolvimento local,
> mas não significa que os dados estão a ser obtidos do seu banco.

Pressione **F12** no seu browser e vá para a aba **Console**.

Verá mensagens em cores:

- ✅ Verde = OK
- ⚠️ Amarelo = Aviso
- ❌ Vermelho = Erro

---

## 📋 O que Procurar

### Erro: "AVISO: URL DO SUPABASE NAO PREENCHIDA"

**Causa**: Não preencheu `js/config.js`

**Solução**:

1. Abra `js/config.js`
2. Mude:

   ```
   url: 'https://seu-projeto.supabase.co'
   ```

   Para a URL real do seu projeto (ex: `https://abcdefg.supabase.co`)

3. Mude:

   ```
   key: 'sua-chave-publica-aqui'
   ```

   Para a chave anónima real

4. Guarde e recarregue

---

### Erro: "AVISO: CHAVE DO SUPABASE NAO PREENCHIDA"

**Causa**: Chave não foi preenchida corretamente. Quando isso ocorre, ou quando o arquivo `config.js` não for executado,
o sistema agora carrega um conjunto de **imagens de exemplo** em vez de falhar completamente. Isso faz com que a página pareça funcionar, mas
as fotos não vêm do seu banco.

**Solução**:

1. Aceda a https://supabase.com
2. Vá para o seu projeto
3. Settings > API
4. Copie **exatamente** a "anon key"
5. Cole em `js/config.js`
6. Recarregue

> Se você vir apenas imagens com texto "Demo", significa que o fallback está ativo — corrija a configuração para carregar dados reais.

---

### Erro: "ERR_FAILED" ou Sem resposta

**Causa**: URL ou chave inválida

**Teste**:

1. No console, digite: `debugConfig()`
2. Verá a configuração actual
3. Verifique:
   - URL começa com `https://`
   - URL termina com `.supabase.co`
   - Chave tem mais de 10 caracteres

---

### Erro: "401 Unauthorized"

**Causa**: Chave inválida ou expirada

**Solução**:

1. Vá ao Supabase Dashboard
2. Settings > API
3. Copie novamente a anon key (regenere se necessário)
4. Cole em config.js
5. Recarregue

---

### Erro: "CORS" ou "Access blocked"

**Causa**: Por vezes browser bloqueia requisições

**Teste**:

1. Digite no console: `testLoad()`
2. Verá se a requisição vai além

**Se funcionar no console mas não na página**:

- Problema de CSP (Content Security Policy)
- Verifique index.html linhas 8-17

---

### Nenhuma mensagem de erro, mas está em branco

**Causa**: Pode estar a carregar

**Teste**:

1. Aguarde 5 segundos
2. Abra console (F12)
3. Digite: `showImages()`
4. Vê alguma imagem? Se sim → está a carregar

---

## 🧪 Testes Manuais (Console)

Digite estes commando no console (F12):

```javascript
// Ver configuração
debugConfig();

// Tentar carregar imagens
testLoad();

// Listar imagens carregadas
showImages(); // agora usa window.appGallery

// Ver todo o estado
appGallery && appGallery.images;
appGallery && appGallery.viewImages;
```

---

## ✅ Checklist

- [ ] `js/config.js` foi editado?
- [ ] URL do Supabase está correcta?
- [ ] Chave anónima foi colada?
- [ ] Ficheiro foi guardado?
- [ ] Página foi recarregada (Ctrl+R)?
- [ ] Tabela `fotos` existe em Supabase?
- [ ] Tabela tem dados (INSERT)?

---

## 🚀 Verificação Completa

Se nada funciona, siga isto:

### 1. Verifique Supabase

```sql
-- SQL Editor em Supabase
SELECT * FROM fotos;
-- Deve retornar registos, nao erro
```

### 2. Verifique RLS (se ativado)

```sql
-- Ver se RLS está ativo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'fotos';
-- Deve mostrar "t" (true)
```

### 3. Verifique config.js

Abra `js/config.js` e confirme:

```javascript
const SUPABASE_CONFIG = {
  url: "https://xyz.supabase.co", // Sem placeholders
  key: "eyJhbGciOi...", // Sem placeholders
  table: "fotos", // Nome correto
  storageBucket: "fotos",
  pageSize: 20,
};
```

### 4. Teste no Console

```javascript
debugConfig(); // Mostra config
testLoad(); // Tenta carregar
```

---

## 🆘 Últimas Dicas

- **Recarregue com Ctrl+Shift+R** (cache cleared)
- **Use navegador diferente** para descartar cache
- **Verifique Network** se há erros HTTP (F12 > Network)
- **Leia o Stack Trace** completo no console

---

## 📞 Informações Úteis

**Supabase Dashboard**: https://supabase.com/dashboard

**Projeto URL Local**:

```bash
python -m http.server 8000
# Depois: http://localhost:8000
```

**Comandos de Debug**:

```
debugConfig()    →  Ver config actual
testLoad()       →  Recarregar imagens
showImages()     →  Ver imagens no array
```

---

**Problema resolvido?** Ótimo! Agora pode publicar no GitHub Pages (ver SECURITY.md)
