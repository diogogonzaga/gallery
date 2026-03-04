/* ========================================
   CONFIGURAÇÃO DO SUPABASE
   ======================================== */

// este console.log ajuda a verificar se o ficheiro foi carregado corretamente
console.log('⚙️ config.js executado');


// Substitua estes valores com as suas credenciais do Supabase
const SUPABASE_CONFIG = {
    // URL do seu projeto Supabase
    url: 'https://uykomsekzcwjsxazzjgj.supabase.co',
    
    // Chave pública (ANON KEY) do Supabase
    key: 'sb_publishable_kDgnfkHgIKWp24LAvoBHag_u4bUPAqy',
    
    // Nome da tabela que contém as imagens
    table: 'fotos',
    
    // Nome do storage bucket (se usar Supabase Storage)
    storageBucket: 'fotos',
    
    // Configurações adicionais
    pageSize: 12, // Número de imagens por página
};

/* ========================================
   INSTRUÇÕES DE SETUP
   ======================================== */

/*
1. Aceda a https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Copie a URL do projeto e a chave pública (ANON KEY)
4. Cole-as neste ficheiro

ESTRUTURA DA TABELA ESPERADA:
- id (UUID, primary key)
- tipo (texto) - Tipo/Categoria da imagem
- imagem_url (texto) - URL da imagem
- created_at (timestamp) - Data de criação

ALTERNATIVA COM STORAGE:
Se pretender usar Supabase Storage:
1. Crie um bucket chamado "gallery_images"
2. Armazene as imagens lá
3. Use a função getImageURL para gerar URLs assinadas

EXEMPLO DE INSERÇÃO:
INSERT INTO fotos (tipo, imagem_url) VALUES
('Natureza', 'https://url-da-imagem'),
('Paisagem', 'https://url-da-imagem'),
('Urbano', 'https://url-da-imagem');
*/
