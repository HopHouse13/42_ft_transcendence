const myImage = document.querySelector("img");

myImage.addEventListener("click", () => {
  const mySrc = myImage.getAttribute("src");
  if (mySrc === "images/aurora.jpg") {
    myImage.setAttribute("src", "images/bird.jpg");
  } else {
    myImage.setAttribute("src", "images/aurora.jpg");
  }
});