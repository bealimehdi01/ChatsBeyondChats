{ pkgs }: {
  deps = [
    pkgs.php82
    pkgs.php82Packages.composer
    pkgs.sqlite
    pkgs.nodejs_20
    pkgs.chromium
    pkgs.glib
    pkgs.nss
    pkgs.freetype
    pkgs.harfbuzz
    pkgs.ca-certificates
  ];
}
