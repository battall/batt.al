<script>
  /** @type {any[]} */
  export let items;
  /** @type {number} width or height in px */
  export let itemSize;
  /** @type {number} width or height in px */
  export let containerSize;
  export let scrollOffset;

  /** @type {"V" | "H"} default vertical */
  export let direction = "V";
  export let overscan = 2;

  const dummySymbol = Symbol("dummy item");

  /**
   * @param {any[]} arr
   * @param {number} start
   * @param {number} end
   */
  function sliceArray(arr, start, end) {
    let arr_return = arr.slice(start, end);

    let expectedLength = end - start;

    // If we don't have enough items we'll fill it up with dummy entries.
    // This makes everything a lot easier, consistent and less edge-casey.
    //while (arr_return.length < expectedLength) {
    //  arr_return.push(dummySymbol);
    //}

    return arr_return;
  }

  /**
   * @param {any[]} arr
   * @param {number} count
   */
  function shiftArray(arr, count) {
    const len = arr.length;
    return count > 0 ? arr.slice(-count).concat(arr.slice(0, len - count)) : arr;
  }

  /**
   * returns the dom index of the item
   * @param {number} index
   */
  export const getItemIndex = (index) => {
    return index % visibleItemCount;
  };

  $: scrollCustom = Math.min(Math.max(0, scrollOffset - itemSize * (overscan / 2)), itemSize * (items.length - visibleItemCount));
  $: visibleItemCount = Math.ceil(containerSize / itemSize) + overscan;
  $: blockSize = visibleItemCount * itemSize;
  $: globalOffset = blockSize * Math.floor(scrollCustom / blockSize);
  $: index0 = Math.floor(scrollCustom / itemSize);
  $: index1 = index0 + visibleItemCount;
  $: numOverlap = index0 % visibleItemCount;
  $: slice = shiftArray(sliceArray(items, index0, index1), numOverlap);

  $: console.log(
    index0,
    index1,
    numOverlap,
    slice.map((i) => i.id),
  );
</script>

<div
  class="flex"
  style:width={direction === "V" ? items.length * itemSize + "px" : "100%"}
  style:height={direction === "H" ? items.length * itemSize + "px" : "100%"}
  tabindex="-1"
>
  {#each slice as item, index}
    <slot
      item={item === dummySymbol ? undefined : item}
      dummy={item === dummySymbol}
      offset={globalOffset + (index < numOverlap ? blockSize : 0)}
    />
  {/each}
</div>
