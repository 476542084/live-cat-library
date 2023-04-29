<script lang="ts">
  import { Subscription, timer } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  const XMLNS = "http://www.w3.org/2000/svg";
  const WIDTH = "75%";
  const HEIGHT = "75%";
  const BACKGROUND_COLOR = "#FFFFFF";
  const SHADOW_COLOR = "#295297";
  const subs: Subscription[] = [];
  let loadingSVG: SVGSVGElement;

  onMount(() => {
    loadingSVG.appendChild(drawLoadingGroup());
  });
  onDestroy(() => {
    subs.forEach((sub) => {
      sub.unsubscribe();
    });
  });
  function drawLoadingGroup() {
    const loadingGroup = document.createElementNS(XMLNS, "g");
    loadingGroup.setAttributeNS(
      null,
      "transform",
      "translate(0.000000,300.000000) scale(0.100000,-0.100000)"
    );
    loadingGroup.setAttributeNS(null, "fill", BACKGROUND_COLOR);
    loadingGroup.setAttributeNS(null, "stroke", "#none");

    const loadingPathTopLeft = document.createElementNS(XMLNS, "path");
    loadingPathTopLeft.setAttributeNS(
      null,
      "d",
      "M220 2324 l0 -576 42 25 c89 51 1163 680 1165 681 1 1 -248 94 -555 206 -306 112 -578 212 -604 222 l-48 18 0 -576z"
    );
    const loadingPathTopRight = document.createElementNS(XMLNS, "path");
    loadingPathTopRight.setAttributeNS(
      null,
      "d",
      "M2173 2676 c-334 -122 -597 -223 -590 -227 6 -4 278 -163 602 -353 l590 -346 3 291 c1 160 1 418 0 573 l-3 283 -602 -221z"
    );
    const loadingPathCenter = document.createElementNS(XMLNS, "path");
    loadingPathCenter.setAttributeNS(
      null,
      "d",
      "M878 2022 c-460 -266 -614 -360 -605 -368 7 -6 285 -171 619 -368 l608 -357 614 368 c339 202 612 371 608 375 -8 8 -1203 699 -1217 704 -5 2 -288 -157 -627 -354z"
    );
    const loadingPathBottomLeft = document.createElementNS(XMLNS, "path");
    loadingPathBottomLeft.setAttributeNS(
      null,
      "d",
      "M220 1193 l0 -378 606 -350 c333 -192 610 -351 615 -353 5 -2 9 145 9 370 l-1 373 -608 358 c-334 196 -611 357 -614 357 -4 0 -7 -170 -7 -377z"
    );
    const loadingPathBottomRight = document.createElementNS(XMLNS, "path");
    loadingPathBottomRight.setAttributeNS(
      null,
      "d",
      "M2163 1222 l-613 -367 0 -373 c0 -225 4 -372 9 -370 5 2 282 161 615 353 l606 350 0 388 c0 213 -1 387 -2 386 -2 0 -279 -165 -615 -367z"
    );

    const loadingPathArray = [];

    loadingPathArray.push(loadingPathTopLeft);
    loadingPathArray.push(loadingPathTopRight);
    loadingPathArray.push(loadingPathBottomRight);
    loadingPathArray.push(loadingPathBottomLeft);
    loadingPathArray.push(loadingPathCenter);

    loadingPathArray.forEach((path, index) => {
      path.style.opacity = "0";
      animate(path, index * 0.2);
      loadingGroup.appendChild(path);
    });
    return loadingGroup;
  }

  function animate(
    opElement: HTMLDivElement | SVGPathElement,
    delay: number = 0
  ) {
    let alpha = 0;
    let speed = 1;
    const source = timer(delay * 1000, 10);
    const sub = source.subscribe(() => {
      if (alpha >= 100) {
        speed = -Math.abs(speed);
      } else if (alpha <= 0) {
        speed = Math.abs(speed);
      }
      alpha += speed;
      opElement.style.opacity = "" + alpha / 100;
    });
    subs.push(sub);
  }
</script>

<svg
  bind:this={loadingSVG}
  version="1.0"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 300.000000 300.000000"
  width={WIDTH}
  height={HEIGHT}
  preserveAspectRatio="xMidYMid meet"
  style="display:block"
  filter={"drop-shadow(0 0 30px " + SHADOW_COLOR + ")"}
/>
