#!/bin/bash
set -e

[ 0 == $UID ] || {
  echo "Builder script require super user permissions."
  exit 0
}

TC_REPO="http://tinycorelinux.net/"

#Packages to be pack in
PACKAGES=()
CURL="curl -L -# --retry 10 --retry-all-errors --connect-timeout 5 --speed-limit 10 --speed-time 5"

require() {
  [ -z "$(command -v $1 2> /dev/null)" ] && {
    echo "Command $1 is required"
    exit 1
  }
  return 0
}

require curl
require unsquashfs
require cpio
require zcat

WORK_DIR="$(pwd)"
echo "Will use '$WORK_DIR' as current dir"

apply_tc_settings() {
  # See http://tinycorelinux.net/downloads.html
  TC_VERSION=$TC_VERSION
  [ -z "$TC_VERSION" ] && TC_VERSION="13"

  # See http://tinycorelinux.net/TC_VERSION
  TC_ARCH=$TC_ARCH
  [ -z "$TC_ARCH" ] && TC_ARCH="x86_64"

  TC_IMAGE=
  TC_CORE=
  TC_ROOTFS=
  case $TC_ARCH in
    "x86")
      TC_IMAGE="Core-current.iso"
      TC_CORE="vmlinuz"
      TC_ROOTFS="core.gz"
      ;;
    "x86_64")
      TC_IMAGE="CorePure64-current.iso"
      TC_CORE="vmlinuz64"
      TC_ROOTFS="corepure64.gz"
      ;;
    *)
      echo "Unsupported ARCH $TC_ARCH"
      exit 1
    ;;
  esac
  echo "Useing tinycore linux $TC_VERSION, arch $TC_ARCH"
}

apply_build_rc() {
  if [ -f "$WORK_DIR/build.rc" ]
  then
    echo "build.rc found. Applying settings."
    source "$WORK_DIR/build.rc"
  fi

  if [ 0 -lt "${#PACKAGES[@]}" ]
  then
    echo "Packages will be install: ${PACKAGES[@]}"
  fi
}

prepare_workspace() {
  TMP_DIR="$WORK_DIR/tinycore.making"

  echo "Create work directory"
  mkdir -v $TMP_DIR
  __clean_on_exit() {
    echo "Cleaning up"
    [ -d "$TMP_DIR/mnt" ] && umount "$TMP_DIR/mnt";
    rm -rf "$TMP_DIR"
  }

  trap __clean_on_exit SIGINT SIGTERM SIGKILL EXIT
}

download_tinycore_linux_image() {
  echo "Download tinycore image"
  (cd "$TMP_DIR"; $CURL -O "$TC_REPO/$TC_VERSION.x/$TC_ARCH/release/$TC_IMAGE")
}

download_packages() {
  if [ 0 -lt "${#PACKAGES[@]}" ]
  then
    echo "Downloading ${#PACKAGES[@]} package(s)."
    for i in ${PACKAGES[@]}
    do
      ( 
        cd "$TMP_DIR" ; 
        echo "Fetching package $i" ;
        $CURL -O "$TC_REPO/$TC_VERSION.x/$TC_ARCH/tcz/$i.tcz" ;
        unsquashfs -f $i.tcz ;
        echo;
      )
    done
    F_APPLY_PACKAGES='true'
  fi
}

copy_core_and_rootfs_from_iso() {
  mkdir "$TMP_DIR/mnt"
  echo "Mount ISO."
  mount "$TMP_DIR/$TC_IMAGE" "$TMP_DIR/mnt" -o loop,ro
  echo "Copy Linux core from ISO."
  cp "$TMP_DIR/mnt/boot/$TC_CORE" "$TMP_DIR/vmlinuz"
  echo "Copy origin rootfs from ISO."
  cp "$TMP_DIR/mnt/boot/$TC_ROOTFS" "$TMP_DIR/core.gz"

  echo "Copy resources finished. Unmount iso."
  umount "$TMP_DIR/mnt"
  rm -rf "$TMP_DIR/mnt"
}

extract_rootfs() {
  echo "Extracting rootfs..."
  mkdir "$TMP_DIR/rootfs"
  ( cd "$TMP_DIR/rootfs"; zcat "$TMP_DIR/core.gz" | cpio -idm )
}

apply_packages() {
  if [ b'true' == b"$F_APPLY_PACKAGES" ]
  then
    echo "Copying packages to rootfs."
    cp -Rp "$TMP_DIR/squashfs-root/usr/" "$TMP_DIR/rootfs/"
  fi
}

apply_additional_patchs() {
  if declare -f additional_patchs > /dev/null 2>&1
  then
    echo "Applying additional patchs."
    (
      cd $TMP_DIR; 
      additional_patchs;
    )
  fi
}

generate_new_rootfs() {
  # repackage core into output.gz
  echo "Generating new rootfs"
  ( cd "$TMP_DIR/rootfs" ; find | cpio -o -H newc ) | gzip -c > "$WORK_DIR/rootfs.gz"
}

copy_core() {
  echo "Copying Linux core"
  cp "$TMP_DIR/vmlinuz" "$WORK_DIR/vmlinuz"
}

#
# Main
#

echo
apply_build_rc
apply_tc_settings
echo

prepare_workspace

download_tinycore_linux_image
download_packages
copy_core_and_rootfs_from_iso
extract_rootfs

apply_additional_patchs

generate_new_rootfs
copy_core

echo
echo "Core copied to $WORK_DIR/vmlinuz"
echo "RootFS generated to $WORK_DIR/rootfs.gz"
echo
