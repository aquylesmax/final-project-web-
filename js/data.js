
const EVENTS = [
  {
    id: "festival-criativo",
    title: "Festival Criativo de Sorocaba",
    category: "Cultura",
    date: "2026-11-14",
    location: "Sorocaba, SP",
    description: "Uma experiência para descobrir artistas, ideias e projetos criativos.",
    images: [
      "assets/evento-festival.jpg",
      "assets/galeria-festival.jpg",
      "assets/destaque-cultural.jpg"
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
      "assets/evento-tecnologia.jpg",
      "assets/galeria-tecnologia.jpg",
      "assets/destaque-tecnologia.jpg"
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
      "assets/evento-gastronomia.jpg",
      "assets/galeria-gastronomia.jpg",
      "assets/destaque-gastronomia.jpg"
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
      "assets/evento-musica.jpg",
      "assets/galeria-musica.jpg",
      "assets/destaque-musica.jpg"
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
      "assets/evento-esporte.jpg",
      "assets/galeria-esporte.jpg",
      "assets/destaque-esporte.jpg"
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
      "assets/evento-mercado.jpg",
      "assets/galeria-mercado.jpg",
      "assets/destaque-mercado.jpg"
    ]
  }
];

window.EVENTS = EVENTS;

// Compatibilidade com páginas que usam window.events
window.events = EVENTS;
