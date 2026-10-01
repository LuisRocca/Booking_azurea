// Metro turns an imported image into an asset id that <image [source]> and tab icons resolve.
declare module '*.png' {
  const asset: number;
  export default asset;
}
