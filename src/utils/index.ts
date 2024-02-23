export const bytesToHumanReadable = (bytes: number) => {
  const units = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return bytes.toFixed(2) + units[i];
};
