{ pkgs }: 
let
  puppeteerDeps = [
    pkgs.glib
    pkgs.nss
    pkgs.nspr
    pkgs.at-spi2-atk
    pkgs.pango
    pkgs.cairo
    pkgs.systemd
    pkgs.dbus
    pkgs.gtk3
    pkgs.alsa-lib
    pkgs.cups
    pkgs.libdrm
    pkgs.xorg.libX11
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXdamage
    pkgs.xorg.libXext
    pkgs.xorg.libXfixes
    pkgs.xorg.libXrandr
    pkgs.mesa
    pkgs.libxkbcommon
    pkgs.xorg.libxcb
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXcursor
    pkgs.xorg.libXxi
    pkgs.xorg.libXScrnSaver
    pkgs.xorg.libXtst
  ];
in {
  deps = [
    pkgs.php82
    pkgs.php82Packages.composer
    pkgs.sqlite
    pkgs.nodejs_20
  ] ++ puppeteerDeps;

  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath puppeteerDeps;
  };
}
