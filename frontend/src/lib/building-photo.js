const photos = {
  'gedung-gsg': {
    src: '/images/gedung-gsg.png',
    alt: 'Tampak depan Gedung Serba Guna Polinela',
    objectPosition: 'center 65%'
  }
};

export function getBuildingPhoto(slug) {
  return photos[slug] ?? null;
}
