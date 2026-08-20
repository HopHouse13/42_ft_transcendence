const monObjet = {
  a: 1,
  b: { c: 2 },
};
function afficheMoi(obj) {
  console.log(obj.b.c);
}
afficheMoi(monObjet);
