
// Array (lista) vazio que vai guardar os objetos de imagem carregados pelo p5.js
let imagens = [];

// Array de strings com os nomes exatos dos ficheiros de imagem guardados no projeto
let caminhosImagens = ['mulher.jpg', 'ceu.jpg', 'mar.jpg']; 

// Índice numérico que indica qual a imagem da galeria (0, 1 ou 2) está ativa no momento
let indiceAtual = 0;

// Definição da largura padrão para o canvas e para o redimensionamento de imagens
let larguraPadrao = 800;

// Definição da altura padrão para o canvas e para o redimensionamento de imagens
let alturaPadrao = 600;

// Variável que guardará o elemento do Canvas criado (necessária para ativar o Drag & Drop)
let cnv;

// Variável que vai guardar o elemento de captura de vídeo da Webcam
let capture; 

// Boolean (verdadeiro/falso) para saber se estamos no Slide 4 (Upload de ficheiros)
let modoUploadAtivo = false;

// Boolean para saber se estamos no Slide 5 (Câmara Web)
let modoCameraAtivo = false;



// FUNÇÃO PRELOAD (EXECUTA ANTES DO SETUP)

function preload() {
  // Ciclo 'for' que percorre a lista de caminhos das imagens para as carregar na memória
  for (let i = 0; i < caminhosImagens.length; i++) {
    // Carrega a imagem e guarda-a na posição 'i' do array 'imagens'
    imagens[i] = loadImage(caminhosImagens[i]); // Caminho do ficheiro a carregar
  }
}



// FUNÇÃO SETUP (CONFIGURAÇÕES INICIAIS)

function setup() {
  // Cria o espaço de desenho (canvas) com 800x600 pixels e guarda a referência em 'cnv'
  cnv = createCanvas(larguraPadrao, alturaPadrao);
  
  // Ativa a funcionalidade de arrastar e soltar ficheiros em cima do canvas, chamando a função 'gotFile'
  cnv.drop(gotFile);
  
  // Ciclo 'for...of' que percorre todas as imagens carregadas
  for (let img of imagens) {
    // Se a imagem existir e tiver sido carregada corretamente, redimensiona-a para 800x600 pixels
    if (img) img.resize(larguraPadrao, alturaPadrao);
  }
  
  // Inicializa a captura de vídeo da Webcam
  capture = createCapture(VIDEO);
  // Redimensiona o feed da camera para 800x600 pixels
  capture.size(larguraPadrao, alturaPadrao);
  // Esconde o elemento HTML do vídeo original que o p5.js cria por defeito por baixo do canvas
  capture.hide(); 
  
  // Pinta o fundo inicial do canvas com um cinzento muito escuro (RGB 15,15,15)
  background(15);
  // Desativa os contornos de todas as formas geométricas que forem desenhadas a partir de agora
  noStroke();
}

function draw() {
  //EXIBIÇÃO POR SLIDES

  // SLIDE 5: MODO CÂMARA
  if (modoCameraAtivo) {
    // Carrega os pixels do vídeo da webcam na memória para podermos ler as suas cores
    capture.loadPixels();
    // Executa o código interno 25 vezes em cada frame para acelerar o efeito de pintura
    for (let i = 0; i < 25; i++) {
      // Sorteia uma coordenada X aleatória dentro da largura do canvas
      let x = random(width);
      // Sorteia uma coordenada Y aleatória dentro da altura do canvas
      let y = random(height);
      // Chama a função de pintura passando as coordenadas e o feed de vídeo como fonte de cor
      pintarMancha(x, y, capture);
    }
  } 
  // SLIDE 4: MODO UPLOAD (DRAG & DROP)
  else if (modoUploadAtivo) {
    // Pinta o fundo com cor escura e opacidade de 10 para criar um rastro visual suave
    background(15, 10);
    // Chama a função que desenha o retângulo pontilhado e o texto de instruções
    desenharZonaDrop();
  } 
  // SLIDES 1, 2, 3: GALERIA DE ARTES (IMAGENS PADRÃO)
  else if (imagens[indiceAtual] && imagens[indiceAtual].width > 0) {
    // Guarda a imagem do slide atual numa variável local de apoio para facilitar a leitura
    let img = imagens[indiceAtual];
    // Carrega os pixels da imagem na memória para podermos ler os valores de cor de cada pixel
    img.loadPixels();

    // Pintura automática contínua: sorteia 20 manchas por frame
    for (let i = 0; i < 20; i++) {
      // Escolhe uma posição X aleatória na tela
      let x = random(width);
      // Escolhe uma posição Y aleatória na tela
      let y = random(height);
      // Pinta a mancha com a cor correspondente extraída da imagem original
      pintarMancha(x, y, img);
    }
    
    // Interação ativa: se o utilizador estiver a carregar no rato
    if (mouseIsPressed) {
      // Desenha 5 manchas extra em cada frame na zona onde o rato se encontra
      for(let j = 0; j < 5; j++) {
        // Aplica uma variação aleatória de -15 a +15 pixels ao redor da posição do rato
        pintarMancha(mouseX + random(-15, 15), mouseY + random(-15, 15), img);
      }
    }
  }

  // Chama a função que desenha o botão "NEXT" e a legenda do slide atual por cima de tudo
  desenharInterface();
}

// FUNÇÕES AUXILIARES E DE INTERAÇÃO

// Função responsável por gerir a navegação entre os slides
function proximaArte() {
  // Se não estivermos nem no upload nem na câmara (estamos na galeria inicial)
  if (!modoUploadAtivo && !modoCameraAtivo) {
    // Se ainda não chegámos ao fim da lista de imagens...
    if (indiceAtual < imagens.length - 1) {
      // Avança para a imagem seguinte
      indiceAtual++;
    } else {
      // Se já era a última imagem, ativa o modo de Upload (Slide 4)
      modoUploadAtivo = true;
    }
  } 
  // Se já estávamos no modo de Upload (Slide 4)
  else if (modoUploadAtivo) {
    // Desativa o modo de Upload
    modoUploadAtivo = false;
    // Ativa o modo de Câmara (Slide 5)
    modoCameraAtivo = true;
  } 
  // Se já estávamos no modo de Câmara (Slide 5)
  else if (modoCameraAtivo) {
    // Desativa o modo de Câmara
    modoCameraAtivo = false;
    // Reinicia o índice para voltar à primeira imagem da galeria (Slide 1)
    indiceAtual = 0;
  }
  
  // Limpa o canvas pintando-o de novo com a cor escura para a nova arte começar do zero
  background(15);
}

// Função que desenha cada mancha orgânica (splat) baseada em ruído de Perlin (noise)
function pintarMancha(x, y, fonte) {
  // Verifica se as coordenadas X e Y estão dentro dos limites visíveis do canvas
  if (x >= 0 && x < width && y >= 0 && y < height) {
    // Extrai a cor (RGBA) do pixel da imagem ou vídeo na posição X e Y
    let col = fonte.get(x, y);
    // Só desenha se a cor não for totalmente transparente (canal Alpha superior a 0)
    if (alpha(col) > 0) {
      // Mapeia o brilho do pixel (0 a 255) para definir o tamanho da mancha (entre 10 e 32 pixels)
      let sz = map(brightness(col), 0, 255, 10, 32);
      
      // Isola as transformações de desenho (push) para não afetar outras formas
      push();
      // Move a origem do sistema de coordenadas (0,0) para a posição (X, Y) onde a mancha vai ser pintada
      translate(x, y);
      // Cria um objeto de cor baseado na cor do pixel extraído da imagem
      let c = color(col);
      // Altera a transparência da cor para 160 (de 0 a 255), tornando a mancha semi-transparente
      c.setAlpha(160);
      // Define a cor de preenchimento da mancha
      fill(c);
      
      // Inicia a criação de uma forma geométrica personalizada e irregular
      beginShape();
      // Ciclo que percorre um círculo completo de 0 a 360 graus (TWO_PI radianos) com passos de 0.6
      for (let a = 0; a < TWO_PI; a += 0.6) {
        // Uso o Perlin Noise para calcular uma variação suave e orgânica no raio da mancha
        let r = sz + map(noise(cos(a) + 1, x * 0.01, frameCount * 0.02), 0, 1, -sz / 3, sz / 3);
        // Calcula a posição do vértice usando trigonometria e adiciona-o à forma
        vertex(r * cos(a), r * sin(a));
      }
      // Fecha a forma geométrica ligando o último ponto ao primeiro
      endShape(CLOSE);
      // Restaura o sistema de coordenadas original (pop)
      pop();
    }
  }
}

// Função que é acionada automaticamente quando um ficheiro é largado em cima do canvas
function gotFile(file) {
  // Verifica se o ficheiro largado é uma imagem
  if (file.type === 'image') {
    // Carrega a imagem a partir dos dados do ficheiro
    loadImage(file.data, (novaImg) => {
      // Redimensiona a imagem para caber perfeitamente no canvas de 800x600 pixels
      novaImg.resize(larguraPadrao, alturaPadrao);
      // Carrega os pixels da nova imagem para que possam ser lidos
      novaImg.loadPixels();
      // Adiciona a nova imagem ao final do array 'imagens'
      imagens.push(novaImg);
      // Atualiza o índice para apontar para esta nova imagem que acabou de ser inserida
      indiceAtual = imagens.length - 1;
      // Desativa o modo de Upload para mostrar a imagem recém-carregada
      modoUploadAtivo = false;
      // Limpa o fundo do ecrã para começar a pintar por cima
      background(15);
    });
  }
}

// Função que desenha o grafismo visual do Slide de Upload
function desenharZonaDrop() {
  // Define uma cor de contorno verde-água semi-transparente
  stroke(0, 255, 150, 150);
  // Define a espessura da linha do contorno como 2 pixels
  strokeWeight(2);
  // Retira o preenchimento para que o retângulo fique transparente por dentro
  noFill();
  // Desenha o retângulo da zona de drop com cantos arredondados (raio de 20px)
  rect(150, 150, width - 300, height - 300, 20);
  // Desativa novamente o contorno para não afetar outros elementos
  noStroke();
  // Define a cor do texto como branco
  fill(255);
  // Alinha o texto tanto verticalmente como horizontalmente ao centro
  textAlign(CENTER, CENTER);
  // Define o tamanho da fonte do texto para 20 pixels
  textSize(20);
  // Escreve a instrução no centro do ecrã
  text("Largue uma imagem aqui para virar uma pintura!", width / 2, height / 2);
}

// Função que desenha os elementos fixos no ecrã (Botão NEXT e legenda do Slide)
function desenharInterface() {
  // Define a cor do botão circular como branco com muita transparência (opacidade de 40)
  fill(255, 40);
  // Garante que o círculo não tem contorno
  noStroke();
  // Desenha o botão em forma de círculo na zona inferior direita do ecrã
  ellipse(width - 50, height - 50, 50, 50);
  // Define a cor do texto do botão como branco sólido
  fill(255);
  // Define o tamanho da fonte para 16 pixels
  textSize(16);
  // Alinha o texto ao centro exato do botão
  textAlign(CENTER, CENTER);
  // Escreve a palavra "NEXT" por cima do círculo do botão
  text("NEXT", width - 50, height - 50);
  
  // Alinha o texto do rodapé à esquerda
  textAlign(LEFT);
  // Reduz o tamanho do texto da legenda para 12 pixels
  textSize(12);
  // Usa um operador ternário encadeado para decidir o texto da legenda com base no estado atual
  let txt = modoCameraAtivo ? "Slide 5: Câmara Live" : (modoUploadAtivo ? "Slide 4: Upload" : "Slide: " + (indiceAtual + 1));
  // Desenha o texto da legenda no canto inferior esquerdo do canvas
  text(txt, 20, height - 20);
}

// Função que "ouve" quando o rato é clicado
function mousePressed() {
  // Calcula a distância entre a posição do rato e o centro do botão "NEXT"
  // Se a distância for menor que o raio do botão (25px), significa que o utilizador clicou no botão
  if (dist(mouseX, mouseY, width - 50, height - 50) < 25) {
    // Avança para o slide ou arte seguinte
    proximaArte();
  }
}

// Função que "ouve" quando qualquer tecla do teclado é pressionada
function keyPressed() {
  // Se a tecla pressionada for 's' ou 'S' (maiúscula ou minúscula)
  if (key === 's' || key === 'S') {
    // Guarda o estado atual do canvas como um ficheiro de imagem JPEG no computador do utilizador
    saveCanvas('minha_obra_generativa', 'jpg');
  }
}