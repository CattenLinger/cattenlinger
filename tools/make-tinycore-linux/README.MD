# Create customized tinycore linux

Same as make-tinycore-linux-from-iso, but download the kernel and ramdisk from repo directly.

Usage

- Create a work directory.
- Write the build.rc file (See the example file)

Then:
```
curl -sL 'https://github.com/CattenLinger/cattenlinger/raw/master/tools/make-tinycore-linux/make-tinycore-linux' | sudo bash -
```

The ramdisk and linux kernel will be copied to the BUILD_OUTPUT(default is WORK_DIR).

See the build.rc.example for more options.