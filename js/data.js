const EVENTS = [
  {
    id: "festival-criativo",
    title: "Festival Criativo de Sorocaba",
    category: "Cultura",
    date: "2026-11-14",
    location: "Sorocaba, SP",
    description: "Uma experiência para descobrir artistas, ideias e projetos criativos.",
    images: [
      "assets/images/eventos/festival-criativo/1.jpg",
      "assets/images/eventos/festival-criativo/2.jpg",
      "assets/images/eventos/festival-criativo/3.jpg"
    ],
    imageAlts: [
      "Barracas brancas e bandeirolas coloridas em um festival ao ar livre",
      "Paleta de tintas coloridas com pincéis",
      "Muro de tijolos pintado com formas geométricas coloridas"
    ]
  },
  {
    id: "encontro-tecnologia",
    title: "Encontro de Tecnologia",
    category: "Tecnologia",
    date: "2026-11-21",
    location: "Sorocaba, SP",
    description: "Conecte-se com pessoas interessadas em tecnologia e inovação.",
    images: [
      "assets/images/eventos/encontro-tecnologia/1.jpg",
      "assets/images/eventos/encontro-tecnologia/2.jpg",
      "assets/images/eventos/encontro-tecnologia/3.jpg"
    ],
    imageAlts: [
      "Plateia assiste a uma apresentação diante de um grande telão",
      "Notebook e xícara de café sobre uma mesa de madeira",
      "Close de uma placa de circuito eletrônico"
    ]
  },
  {
    id: "feira-gastronomica",
    title: "Feira Gastronômica",
    category: "Gastronomia",
    date: "2026-11-28",
    location: "Sorocaba, SP",
    description: "Conheça novos sabores e aproveite uma experiência gastronômica.",
    images: [
      "assets/images/eventos/feira-gastronomica/1.jpg",
      "assets/images/eventos/feira-gastronomica/2.jpg",
      "assets/images/eventos/feira-gastronomica/3.jpg"
    ],
    imageAlts: [
      "Food truck sob as árvores com mesas ao ar livre",
      "Pizza de queijo com tomatinhos e alecrim, vista de cima",
      "Limão, folhas de louro e pimentas secas sobre uma tábua de madeira"
    ]
  },
  {
    id: "musica-ao-vivo",
    title: "Música ao Vivo no Parque",
    category: "Música",
    date: "2026-12-05",
    location: "Sorocaba, SP",
    description: "Uma programação musical para aproveitar com amigos e família.",
    images: [
      "assets/images/eventos/musica-ao-vivo/1.jpg",
      "assets/images/eventos/musica-ao-vivo/2.jpg",
      "assets/images/eventos/musica-ao-vivo/3.jpg"
    ],
    imageAlts: [
      "Palco ao ar livre com banda e público",
      "Violão acústico em close",
      "Disco de vinil preto sobre fundo amarelo-alaranjado"
    ]
  },
  {
    id: "corrida-comunidade",
    title: "Movimento e Comunidade",
    category: "Esporte",
    date: "2026-12-12",
    location: "Sorocaba, SP",
    description: "Uma atividade para reunir a comunidade e incentivar o movimento.",
    images: [
      "assets/images/eventos/corrida-comunidade/1.jpg",
      "assets/images/eventos/corrida-comunidade/2.jpg",
      "assets/images/eventos/corrida-comunidade/3.jpg"
    ],
    imageAlts: [
      "Grupo de corredores visto de costas durante uma corrida de rua",
      "Par de tênis esportivo branco e laranja sobre fundo claro",
      "Medalha de corrida sobre piso de madeira"
    ]
  },
  {
    id: "mercado-autoral",
    title: "Mercado Autoral",
    category: "Feira",
    date: "2026-12-19",
    location: "Sorocaba, SP",
    description: "Descubra produtos independentes e iniciativas locais.",
    images: [
      "assets/images/eventos/mercado-autoral/1.jpg",
      "assets/images/eventos/mercado-autoral/2.jpg",
      "assets/images/eventos/mercado-autoral/3.jpg"
    ],
    imageAlts: [
      "Vista aérea de uma feira com barracas de toldos coloridos",
      "Cerâmicas azuis e brancas em uma prateleira",
      "Tecido feito à mão com listras coloridas em diagonal"
    ]
  }
];

window.EVENTS = EVENTS;

// Compatibilidade com paginas que usam window.events
window.events = EVENTS;
