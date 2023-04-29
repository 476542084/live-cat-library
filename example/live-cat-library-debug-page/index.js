import { Loading } from "live-cat-library";
let loadingCompoent = "";
window.addEventListener("DOMContentLoaded", () => {
  loadingCompoent = new Loading(
    document.body,
    {
      // loadingImage:
      //   "https://app-pre.3dcat.live:14431/images/3500/3843/2023/03/1641744786857791488.jpg",
      loadingBgImage: {
        portrait:
          "https://app-pre.3dcat.live:14431/images/3500/3843/2023/03/1641744883955929088.jpg",
        landscape:
          "https://app-pre.3dcat.live:14431/images/3500/3843/2023/03/1641744786857791488.jpg",
      },
      // loadingBarImage:
      //   "https://app-pre.3dcat.live:14431/images/3500/3843/2023/03/1641744786857791488.jpg",
    },
    (res) => {
      console.log("res", res);
    }
  );
  window.loadingCompoent = loadingCompoent;
});
