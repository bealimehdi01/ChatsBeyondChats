{ pkgs }: {
  deps = [
    pkgs.php82
    pkgs.php82Packages.composer
    pkgs.sqlite
    pkgs.nodejs-18_x
    pkgs.chromium
    pkgs.glib
    pkgs.nss
    pkgs.freetype
    pkgs.freetype.dev
    pkgs.harfbuzz
    pkgs.ca-certificates
  ];
}
