#!/bin/bash
set -e

[ 0 == $UID ] || {
  echo "Builder script require super user permissions."
  exit 0
}

unset DOWNLOAD FETCH PACKAGES

TC_REPO="$TC_REPO"
[ -z "$TC_REPO" ] && TC_REPO="http://tinycorelinux.net/"

#Packages to be pack in

PACKAGES=()
CURL_DOWNLOAD="curl -L -# --retry 10 --retry-all-errors --connect-timeout 5 --speed-limit 10 --speed-time 5"
DOWNLOAD() {
  eval "$CURL_DOWNLOAD $@"
}

CURL_FETCH="curl -sf --retry 10 --connect-timeout 5 --speed-time 5"
FETCH() {
  eval "$CURL_FETCH $@"
}


# Should cache downloaded files
CACHE_FILES="$CACHE_FILES"
cache_files() {
  [ b'true' == b"$CACHE_FILES" ]
}

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
require uniq

WORK_DIR="$(pwd)"
echo "Will use '$WORK_DIR' as current dir"

#
# Tinycore Linux Properties
#
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

#
# Source the build.rc
#
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
  BUILD_DIR="$WORK_DIR/build"

  if [ ! -d "$BUILD_DIR" ]
  then
    echo "Create build directory"
    mkdir -v "$BUILD_DIR"
  fi

  EXIT_HOOKS=": && rm -rf $BUILD_DIR/*.tmp "

  __clean_on_exit() {
    echo "Executing exit hook."
    eval "$EXIT_HOOKS"
  }

  trap __clean_on_exit SIGINT SIGTERM SIGKILL EXIT
}

prepare_tinycore_linux_image() {
  local tcimage="$BUILD_DIR/$TC_IMAGE"

  if [ ! -f "$tcimage" ]
  then
    echo "Download tinycore image."
    (cd "$BUILD_DIR"; DOWNLOAD "$TC_REPO/$TC_VERSION.x/$TC_ARCH/release/$TC_IMAGE" -o "$TC_IMAGE.tmp"; mv "$TC_IMAGE.tmp" "$TC_IMAGE")
    cache_files || EXIT_HOOKS="$EXIT_HOOKS && rm -rf '$tcimage'"
  fi

  echo "Using system image '$tcimage'."
}

prepare_packages() {
  PACKAGE_DIR="$BUILD_DIR/tcz"
  PACKAGE_LIST="$BUILD_DIR/pacakge.list"

  [ -d "$PACKAGE_DIR" ] || mkdir "$PACKAGE_DIR"
  EXIT_HOOKS="$EXIT_HOOKS && find '$PACKAGE_DIR' -name '*.tmp' -exec rm -rf {} \; "

  cache_files || EXIT_HOOKS="$EXIT_HOOKS && rm -rf '$PACKAGE_DIR'"

  resolve_packages() {
    touch "$PACKAGE_LIST"

    for i in ${PACKAGES[@]}
    do
      (
        echo "Resolving package '$i'..."
        (FETCH -sf "$TC_REPO/$TC_VERSION.x/$TC_ARCH/tcz/$i.tcz.dep" || :) >> "$PACKAGE_LIST.tmp"
        echo "$i.tcz" >> "$PACKAGE_LIST.tmp"
      )
    done

    cat "$PACKAGE_LIST.tmp" | uniq | sed '/^$/d' > "$PACKAGE_LIST"
  }

  download_and_unpack_packages() {
    echo "Start preparing $(cat $PACKAGE_LIST | wc -l) packages..."
    local _IFS="$IFS"
    IFS=$'\n'
    local i
    for i in $(cat "$PACKAGE_LIST")
    do
      [ -z "$i" ] && continue

      [ -f "$PACKAGE_DIR/$i" ] || (
        cd "$PACKAGE_DIR" ; 
        echo "Fetching package '$i'..." ;
        DOWNLOAD "$TC_REPO/$TC_VERSION.x/$TC_ARCH/tcz/$i" -o "$i.tmp" ;
        mv "$i.tmp" "$i"
      )

      ( 
        echo "Unpacking $i";
        cd "$BUILD_DIR";
        unsquashfs -f "$PACKAGE_DIR/$i" ;
        echo;
      )
    done
  }

  if [ 0 -lt "${#PACKAGES[@]}" ]
  then
    echo "Preparing ${#PACKAGES[@]} package(s)."
    resolve_packages
    download_and_unpack_packages

    F_APPLY_PACKAGES='true'
  fi
}

copy_core_and_rootfs_from_iso() {
  local mountpoint="$BUILD_DIR/mnt"
  
  mkdir "$mountpoint"
  echo "Mount ISO."
  mount "$BUILD_DIR/$TC_IMAGE" "$mountpoint" -o loop,ro
  echo "Copy Linux core from ISO."
  cp "$mountpoint/boot/$TC_CORE" "$BUILD_DIR/vmlinuz"
  EXIT_HOOKS="$EXIT_HOOKS && rm -rf '$BUILD_DIR/vmlinuz'"
  echo "Copy origin rootfs from ISO."
  cp "$mountpoint/boot/$TC_ROOTFS" "$BUILD_DIR/core.gz"
  EXIT_HOOKS="$EXIT_HOOKS && rm -rf '$BUILD_DIR/core.gz'"

  echo "Copy resources finished. Unmount."
  umount "$mountpoint"
  rm -rf "$mountpoint"
}

extract_rootfs() {
  local rootfs="$BUILD_DIR/rootfs"
  echo "Extracting rootfs..."

  mkdir "$rootfs"
  ( cd "$rootfs"; zcat "$BUILD_DIR/core.gz" | cpio -idm )
  EXIT_HOOKS="$EXIT_HOOKS && rm -rf '$rootfs'"
}

apply_packages() {
  if [ b'true' == b"$F_APPLY_PACKAGES" ]
  then
    echo "Copying packages to rootfs."
    cp -Rp "$BUILD_DIR/squashfs-root/usr/" "$BUILD_DIR/rootfs/"
    EXIT_HOOKS="$EXIT_HOOKS && rm -rf '$BUILD_DIR/squashfs-root'"
  fi
}

apply_additional_patchs() {
  if declare -f additional_patchs > /dev/null 2>&1
  then
    echo "Applying additional patchs."
    (
      cd $BUILD_DIR; 
      additional_patchs;
    )
  fi
}

generate_new_rootfs() {
  # repackage core into output.gz
  echo "Generating new rootfs"
  ( cd "$BUILD_DIR/rootfs" ; find | cpio -o -H newc ) | gzip -c > "$WORK_DIR/rootfs.gz"
}

copy_core() {
  echo "Copying Linux core"
  cp "$BUILD_DIR/vmlinuz" "$WORK_DIR/vmlinuz"
}

#
# Main
#

echo
apply_build_rc
apply_tc_settings
echo

prepare_workspace

prepare_tinycore_linux_image
prepare_packages

copy_core_and_rootfs_from_iso
extract_rootfs

apply_packages
apply_additional_patchs

generate_new_rootfs
copy_core

echo
echo "Core copied to $WORK_DIR/vmlinuz"
echo "RootFS generated to $WORK_DIR/rootfs.gz"
echo
