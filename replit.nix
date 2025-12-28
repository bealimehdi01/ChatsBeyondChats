{ pkgs }: {
  deps = [
    pkgs.php82
    pkgs.php82Packages.composer
    pkgs.sqlite
    pkgs.nodejs_20
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
  ];
}
